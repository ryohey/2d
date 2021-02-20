import _ from "lodash"
import { atom } from "recoil"
import { exampleGraph } from "../helpers/exampleGraph"
import { createFunction, getParamNames } from "../helpers/functionHelper"
import { notEmpty } from "../helpers/typeHelper"
import { NodeId } from "../topology/Graph"
import {
  AnyFuncNode,
  AnyNode,
  DisplayFuncNode,
  FuncEdge,
  IFuncNode,
  isFuncNode,
  isReferenceFuncNode,
  IVariableNode,
  PreviewEdge,
} from "../types"

export const previewNodeState = atom<DisplayFuncNode | null>({
  key: "previewNodeState",
  default: null,
})

export const previewEdgeState = atom<PreviewEdge | null>({
  key: "previewEdgeState",
  default: null,
})

export const nodesState = atom<AnyNode[]>({
  key: "nodesState",
  default: exampleGraph.nodes,
})

export const edgesState = atom<FuncEdge[]>({
  key: "edgesState",
  default: exampleGraph.edges,
})

export const editingNodeState = atom<AnyNode | null>({
  key: "editingNodeState",
  default: null,
})

export const getNode = (nodes: AnyNode[]) => (id: NodeId): AnyNode => {
  const node = nodes.find((b) => b.id === id)
  if (node === undefined) {
    throw new Error(`node ${id} does not exist`)
  }
  return node
}

export const getFuncNode = (nodes: AnyNode[]) => (id: NodeId): AnyFuncNode => {
  const node = getNode(nodes)(id)
  if (!(isFuncNode(node) || isReferenceFuncNode(node))) {
    throw new Error("node is not FuncNode")
  }
  return node
}

export const getOriginFuncNode = (nodes: AnyNode[]) => (
  id: NodeId
): IFuncNode => {
  const node = getNode(nodes)(id)
  switch (node.type) {
    case "FuncNode":
      return node
    case "ReferenceFuncNode":
      return getOriginFuncNode(nodes)(node.reference)
    case "VariableNode":
      throw new Error("origin node is not exist")
  }
}

/*
    表示用の node オブジェクトを取得する
    inputLength など表示に必要なプロパティが追加されている
    link 先を取得しなくても表示できるように name プロパティなども追加する
  */
export const getDisplayNode = (nodes: AnyNode[]) => (
  id: NodeId
): DisplayFuncNode | null => {
  const node = getNode(nodes)(id)
  if (node === undefined || !(isFuncNode(node) || isReferenceFuncNode(node))) {
    return null
  }
  const origin = getOriginFuncNode(nodes)(id)
  return {
    id: node.id,
    type: "FuncNode",
    x: node.x,
    y: node.y,
    linked: isReferenceFuncNode(node),
    name: origin.name,
    isAsync: origin.isAsync,
    code: origin.code,
    inputNames: getFuncNodeInputNames(nodes)(id),
  }
}

export const allDisplayNodes = (nodes: AnyNode[]): DisplayFuncNode[] =>
  nodes.map((b) => getDisplayNode(nodes)(b.id)).filter(notEmpty)

export const addNode = (nodes: AnyNode[]) => (node: AnyNode) => [
  ...nodes,
  {
    ...node,
    id: lastNodeId(nodes) + 1,
  },
]

export const dupulicateNode = (nodes: AnyNode[]) => (id: NodeId) => {
  const block = getFuncNode(nodes)(id)
  return addNode(nodes)({
    ...block,
    y: block.y + 180,
  })
}

export const addReferenceFuncNode = (nodes: AnyNode[]) => (id: NodeId) => {
  const block = getFuncNode(nodes)(id)
  const reference = isReferenceFuncNode(block) ? block.reference : id
  return addNode(nodes)({
    type: "ReferenceFuncNode",
    reference,
    x: block.x,
    y: block.y + 180,
    id: -1,
  })
}

export const getFuncNodeInputNames = (nodes: AnyNode[]) => (id: NodeId) => {
  let node = getNode(nodes)(id)
  if (node === undefined) {
    return []
  }
  if (isReferenceFuncNode(node)) {
    node = getNode(nodes)(node.reference)
  }
  if (node === undefined) {
    return []
  }
  if (!isFuncNode(node)) {
    return []
  }
  const func = createFunction(node.code)
  const names = getParamNames(func)
  return names
}

export const getUniqueNodeName = (nodes: AnyNode[]) => (
  requiredName: string = ""
) => {
  let name = requiredName
  let count = 2
  while (_.find(nodes, { name })) {
    name = `${requiredName}${count}`
    count++
  }
  return name
}

export const removeNode = (nodes: AnyNode[]) => (id: NodeId) => {
  _.reject(nodes, (b) => b.id === id)
    .filter(isReferenceFuncNode)
    .filter((b) => b.reference === id)
    .forEach((b) => (nodes = removeNode(nodes)(b.id)))
  return nodes
}

export const removeNodeFromEdges = (edges: FuncEdge[]) => (id: NodeId) =>
  _.reject(edges, (e) => e.toId === id || e.fromId === id)

export const lastNodeId = (nodes: AnyNode[]) => {
  const maxId = _.max(nodes.map((b) => b.id))
  return maxId !== undefined ? maxId : -1
}

export const updateNode = (nodes: AnyNode[]) => (
  id: NodeId,
  updater: (node: AnyNode) => AnyNode
) =>
  nodes.map((b) => {
    if (b.id !== id) {
      return b
    }
    return updater(b)
  })

export const addEdge = (edges: FuncEdge[]) => (
  fromId: NodeId,
  toId: NodeId,
  toIndex: number
) => {
  const edge = { fromId, toId, toIndex }
  if (!_.find(edges, edge)) {
    return [...edges, edge]
  }
  return edges
}

export const removeEdge = (edges: FuncEdge[]) => (fromId: NodeId) =>
  _.reject(edges, (e) => e.fromId === fromId)

export const createFuncNode = (x: number, y: number): IFuncNode => ({
  type: "FuncNode",
  x,
  y,
  name: "func",
  code: `x => x`,
  isAsync: false,
  id: -1,
})

export const createVariableNode = (x: number, y: number): IVariableNode => ({
  type: "VariableNode",
  x,
  y,
  name: "variable",
  id: -1,
  value: "",
})
