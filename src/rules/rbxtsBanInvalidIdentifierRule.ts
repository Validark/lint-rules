import * as Lint from "tslint";
import * as ts from "typescript";

export class Rule extends Lint.Rules.AbstractRule {
  public static metadata: Lint.IRuleMetadata = {
    ruleName: "rbxts-ban-invalid-identifier",
    description: "Disallows invalid Lua characters or Lua keywords in identifiers.",
    optionsDescription: "Not configurable.",
    options: undefined,
    optionExamples: ["true"],
    type: "functionality",
    typescriptOnly: false,
  }

  public readonly ruleSeverity = "error";

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithFunction(sourceFile, walk);
  }
}

const RBXTS_RESERVED_REGEX = /^_[0-9]+$/;
const LUA_IDENTIFIER_REGEX = /^[_a-zA-Z][_a-zA-Z0-9]*$/;
const LUA_KEYWORDS = [
  "and",    "break",  "do",   "else",     "elseif",
  "end",    "false",  "for",  "function", "if",
  "in",     "local",  "nil",  "not",      "or",
  "repeat", "return", "then", "true",     "until",
  "while",
];

function walk(ctx: Lint.WalkContext<void>) {
  const DECLARATION_SYNTAX_KIND = [
    ts.SyntaxKind.ClassDeclaration,
    ts.SyntaxKind.EnumDeclaration,
    ts.SyntaxKind.EnumMember,
    ts.SyntaxKind.FunctionDeclaration,
    ts.SyntaxKind.MethodDeclaration,
    ts.SyntaxKind.Parameter,
    ts.SyntaxKind.PropertyDeclaration,
  ];

  function cb(node: ts.Node): void {
    // we take the nodes that is of type Identifier whose parents are these kind that get compiled to Lua
    if (ts.isIdentifier(node) && DECLARATION_SYNTAX_KIND.some(kind => kind === node.parent.kind)) {
      reportIfBadIdentifier(node);
    }

    // VariableDeclaration have multiple identifiers and it's possible for it to incorrectly label `undefined`
    // so we need this statement for this node specifically
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
      reportIfBadIdentifier(node.name);
    }

    return ts.forEachChild(node, cb);
  }

  function reportIfBadIdentifier(node: ts.Identifier) {
    if (!LUA_IDENTIFIER_REGEX.test(node.text)) {
      // if the identifier does not match with the rules of Lua identifiers
      ctx.addFailureAtNode(node, `'${node.text}' must be a valid Lua identifier`);
    } else if (LUA_KEYWORDS.some(keyword => keyword === node.text)) {
      ctx.addFailureAtNode(node, `'${node.text}' must not be a Lua keyword`);
    } else if (node.text === "_exports" || node.text === "undefined" || RBXTS_RESERVED_REGEX.test(node.text)) {
      ctx.addFailureAtNode(node, `'${node.text}' is a reserved identifier for Roblox-TS`)
    }
  }

  return ts.forEachChild(ctx.sourceFile, cb);
}
