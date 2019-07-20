import {
  ICodeBlock,
  isCodeBlock,
  isReferenceBlock,
  AnyNode,
  AnyBlock,
  FuncEdge
} from "../types"
import { foldTree } from "../topology/Tree"
import { graphToTree } from "../topology/graphToTree"

interface IntermediateCode {
  code: string
  varName: string
  isPromise: boolean
}

export default function buildCode(nodes: AnyNode[], edges: FuncEdge[]) {
  const trees = graphToTree(nodes, edges)

  const getFuncVarName = (block: ICodeBlock) => {
    const f = block.name ? `${block.name}` : `func${block.id}`
    if ((window as any)[f] !== undefined) {
      // グローバルな関数と名前が被らないようにする
      return `__${f}`
    }
    return f
  }

  const functionCodes = nodes
    .filter(isCodeBlock)
    .map(block => {
      const varName = getFuncVarName(block)
      return `const ${varName} = ${block.code}`
    })
    .join("\n")

  const getOriginBlock = (block: AnyBlock): ICodeBlock => {
    switch (block.type) {
      case "CodeBlock":
        return block
      case "ReferenceBlock":
        const node = nodes.filter(n => n.id === block.reference)[0]
        if (isCodeBlock(node)) {
          return node
        }
        if (isReferenceBlock(node)) {
          return getOriginBlock(node)
        }
        throw new Error("Origin node is not block")
    }
  }

  // create function calls
  const codes = trees.map(tree =>
    foldTree(tree, (node, children: IntermediateCode[]) => {
      if (!(isCodeBlock(node.value) || isReferenceBlock(node.value))) {
        throw new Error("node not supported")
      }
      const block = getOriginBlock(node.value)
      const funcName = getFuncVarName(block)
      const varName = `${block.name}_out${node.value.id}`

      const promiseInputs = children
        .filter(c => c.isPromise)
        .map(c => c.varName)
      let code: string

      if (promiseInputs.length === 0) {
        code = `const ${varName} = ${funcName}(${children
          .map(c => c.varName)
          .join(", ")})`
      } else {
        code = `const ${varName} = Promise.all([
          ${promiseInputs.join(", ")}
        ]).then(result => {
          const [${promiseInputs.map(i => i + "_p").join(", ")}] = result
          return ${funcName}(${children
          .map(c => (c.isPromise ? c.varName + "_p" : c.varName))
          .join(", ")})
        })`
      }

      return {
        code: children.map(c => c.code).join("\n") + "\n" + code,
        varName,
        isPromise: block.isAsync || children.some(c => c.isPromise)
      }
    })
  )

  return functionCodes + "\n" + codes.map(c => c.code).join("\n")
}
