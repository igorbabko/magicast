import { promises as fsp } from "node:fs";
import * as recast from "recast";
import { ModuleNode } from "./ast";
import { ParsedFileNode, ASTOptions } from "./types";

export function parseCode(code: string, options?: ASTOptions): ModuleNode {
  const node: ParsedFileNode = recast.parse(code, options);
  return new ModuleNode(node);
}

export function generateCode(
  module: ModuleNode,
  options?: ASTOptions
): { code: string; map?: any } {
  const { code, map } = recast.print(module.node, options);
  return { code, map };
}

export async function loadFile(
  filename: string,
  options: ASTOptions = {}
): Promise<ModuleNode> {
  const contents = await fsp.readFile(filename, "utf8");
  options.sourceFileName = options.sourceFileName ?? filename;
  return parseCode(contents, options);
}

export async function writeFile(
  node: ModuleNode,
  filename?: string,
  options?: ASTOptions
): Promise<void> {
  const { code, map } = generateCode(node, options);
  filename = filename || node.node.name || "output.js";
  await fsp.writeFile(filename, code);
  if (map) {
    await fsp.writeFile(filename + ".map", map);
  }
}
