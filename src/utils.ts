export const enum ScriptType {
  Server,
  Client,
  Module,
}

export function splitExtensions(name: string, removeLint = true): string[] {
  const exts = name.split(".").map(e => e.toLowerCase());

  // since tslint requires test cases' files to end with .lint,
  // and we obviously want to keep the logic below simple, we therefore need to remove 'lint'...
  if (removeLint && exts[exts.length - 1] === "lint") exts.pop();

  return exts;
}

export function isTsLikeFile(name: string): boolean {
  const exts = splitExtensions(name);
  const lastExtension = exts[exts.length - 1];

  return lastExtension === "ts" || lastExtension === "tsx";
}

export function getScriptType(name: string): ScriptType {
  const exts = splitExtensions(name);
  const secondLastExt = exts[exts.length - 2];
  const hasThreeOrMore = exts.length >= 3; // a.server.ts vs server.ts

  if (secondLastExt === "server" && hasThreeOrMore) {
    return ScriptType.Server;
  } else if (secondLastExt === "client" && hasThreeOrMore) {
    return ScriptType.Client;
  } else {
    return ScriptType.Module;
  }
}
