import * as Lint from "tslint";
import * as ts from "typescript";
import { isTsLikeFile, getScriptType, ScriptType } from "../utils";

export class Rule extends Lint.Rules.AbstractRule {
  public static metadata: Lint.IRuleMetadata = {
    ruleName: "rbxts-require-export-in-modulescript",
    description: "Requires a ModuleScript to export at least one member.",
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

function walk(ctx: Lint.WalkContext<void>) {
  if (!isTsLikeFile(ctx.sourceFile.fileName)) return;
  if (getScriptType(ctx.sourceFile.fileName) !== ScriptType.Module) return;

  let exportedCount = 0;
  function cb(node: ts.Node): void {
    if (ts.isExportAssignment(node) || (node.modifiers && node.modifiers.some(m => m.kind === ts.SyntaxKind.ExportKeyword))) {
      exportedCount++;
    }

    return ts.forEachChild(node, cb);
  }

  ts.forEachChild(ctx.sourceFile, cb)
  if (exportedCount === 0) {
    ctx.addFailure(0, 0, "ModuleScript must have at least one exported member");
  }
}
