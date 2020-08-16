import parser from "@babel/parser"
import { default as traverse } from "@babel/traverse";
import { default as generate } from "@babel/generator";
import { basename, dirname, extname, join } from "path";
import { promises } from "fs";

/** TODO: entryは外側から渡す or configで渡す */
const entryPath = "index.js";

const basePath = dirname(entryPath)
const ast = parser.parse(await promises.readFile(entryPath, "utf-8"))

traverse(ast, {
  CallExpression({ node: { callee, arguments: args } }) {
    if (callee.type === "Identifier" && callee.name === "require") {
      const filePath = getScriptFilePath(basePath, (args[0] as any).value)
    }
  }
})

function getFileName(filename: string) {
  if (filename === ".") {
    return "index.js"
  }

  if (extname(filename) === "") {
    return `${filename}.js`;
  }

  return filename
}


function getScriptFilePath(basePath: string, filename: string) {
  if (isNodeModuel(filename)) {
    return join(basePath, getFileName(filename))
  }

  const moduleBasePath = join(basePath, "node_modules", filename)

  if (filename.includes('/')) {
    const dir = dirname(moduleBasePath)
    const name = basename(moduleBasePath)

    return join(dir, getFileName(name))
  }

  const { main } = require(join(moduleBasePath, "package.json"))

  return join(moduleBasePath, getFileName(main));
}
