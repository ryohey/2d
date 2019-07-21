import {
  IFuncNode,
  isFuncNode,
  isReferenceFuncNode,
  AnyNode,
  AnyFuncNode,
  FuncEdge,
  IVariableNode
} from "../types"
import { foldTree } from "../topology/Tree"
import { graphToTree } from "../topology/graphToTree"
import { NodeId, IGraph } from "../topology/Graph"

interface IntermediateCode {
  code: string
  varName: string
  isPromise: boolean
}

const getFuncVarName = (node: { name: string; id: NodeId }) => {
  const f = node.name ? `${node.name}` : `func${node.id}`
  if ((window as any)[f] !== undefined) {
    // グローバルな関数と名前が被らないようにする
    return `__${f}`
  }
  return f
}

const makeFuncNodeCode = (
  node: IFuncNode,
  nodeId: NodeId,
  children: IntermediateCode[]
): IntermediateCode => {
  const funcName = getFuncVarName(node)
  const varName = `${node.name}_out${nodeId}`

  const promiseInputs = children.filter(c => c.isPromise).map(c => c.varName)
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
    isPromise: node.isAsync || children.some(c => c.isPromise)
  }
}

const makeVariableNodeCode = (node: IVariableNode): IntermediateCode => {
  const varName = getFuncVarName(node)
  return {
    code: `const ${varName} = ${node.value.value}`,
    varName,
    isPromise: false
  }
}

export default function buildCode(graph: IGraph<AnyNode, FuncEdge>) {
  const { nodes } = graph
  const trees = graphToTree(graph)

  const functionCodes = nodes
    .filter(isFuncNode)
    .map(node => {
      const varName = getFuncVarName(node)
      return `const ${varName} = ${node.code}`
    })
    .join("\n")

  const getOriginNode = (node: AnyFuncNode): IFuncNode => {
    switch (node.type) {
      case "FuncNode":
        return node
      case "ReferenceFuncNode":
        const originNode = nodes.filter(n => n.id === node.reference)[0]
        if (isFuncNode(originNode)) {
          return originNode
        }
        if (isReferenceFuncNode(originNode)) {
          return getOriginNode(originNode)
        }
        throw new Error("Origin node is not FuncNode")
    }
  }

  // create function calls
  const codes = trees.map(tree =>
    foldTree(tree, (node, children: IntermediateCode[]) => {
      switch (node.value.type) {
        case "FuncNode":
          return makeFuncNodeCode(node.value, node.value.id, children)
        case "ReferenceFuncNode":
          const originNode = getOriginNode(node.value)
          return makeFuncNodeCode(originNode, node.value.id, children)
        case "VariableNode":
          return makeVariableNodeCode(node.value)
      }
    })
  )

  return functionCodes + "\n" + codes.map(c => c.code).join("\n")
}
