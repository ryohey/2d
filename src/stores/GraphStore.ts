import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import _ from "lodash"
import { exampleGraph } from "../helpers/exampleGraph"
import { createFunction, getParamNames } from "../helpers/functionHelper"
import { notEmpty } from "../helpers/typeHelper"
import { IGraph, NodeId } from "../topology/Graph"
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

const rejectNode = (nodes: AnyNode[]) => (id: NodeId) => {
  _.reject(nodes, (b) => b.id === id)
    .filter(isReferenceFuncNode)
    .filter((b) => b.reference === id)
    .forEach((b) => (nodes = rejectNode(nodes)(b.id)))
  return nodes
}

export const lastNodeId = (nodes: AnyNode[]) => {
  const maxId = _.max(nodes.map((b) => b.id))
  return maxId !== undefined ? maxId : -1
}

const createFuncNode = (x: number, y: number): IFuncNode => ({
  type: "FuncNode",
  x,
  y,
  name: "func",
  code: `x => x`,
  isAsync: false,
  id: -1,
})

const createVariableNode = (x: number, y: number): IVariableNode => ({
  type: "VariableNode",
  x,
  y,
  name: "variable",
  id: -1,
  value: "",
})

export const graphSlice = createSlice({
  name: "graph",
  initialState: {
    current: exampleGraph as IGraph<AnyNode, FuncEdge>,
    editingNode: null as AnyNode | null,
    previewEdge: null as PreviewEdge | null,
    previewNode: null as DisplayFuncNode | null,
  },
  reducers: {
    setEdges: (state, action: PayloadAction<FuncEdge[]>) => {
      state.current.edges = action.payload
    },
    setNodes: (state, action: PayloadAction<AnyNode[]>) => {
      state.current.nodes = action.payload
    },
    setEditingNode: (state, action: PayloadAction<AnyNode | null>) => {
      state.editingNode = action.payload
    },
    setPreviewEdge: (state, action: PayloadAction<PreviewEdge | null>) => {
      state.previewEdge = action.payload
    },
    setPreviewNode: (state, action: PayloadAction<DisplayFuncNode | null>) => {
      state.previewNode = action.payload
    },
    addFuncNode: (state, action: PayloadAction<{ x: number; y: number }>) => {
      state.current.nodes = [
        ...state.current.nodes,
        createFuncNode(action.payload.x, action.payload.y),
      ]
    },
    addVariableNode: (
      state,
      action: PayloadAction<{ x: number; y: number }>
    ) => {
      state.current.nodes = [
        ...state.current.nodes,
        createVariableNode(action.payload.x, action.payload.y),
      ]
    },
    addNode: (state, action: PayloadAction<AnyNode>) => {
      const { nodes } = state.current
      state.current.nodes = [
        ...nodes,
        {
          ...action.payload,
          id: lastNodeId(nodes) + 1,
        },
      ]
    },
    dupulicateNode: (state, action: PayloadAction<NodeId>) => {
      const { nodes } = state.current
      const block = getFuncNode(nodes)(action.payload)
      state.current.nodes = [
        ...nodes,
        {
          ...block,
          y: block.y + 180,
        },
      ]
    },
    addReferenceFuncNode: (state, action: PayloadAction<NodeId>) => {
      const { nodes } = state.current
      const id = action.payload
      const block = getFuncNode(nodes)(id)
      const reference = isReferenceFuncNode(block) ? block.reference : id
      state.current.nodes = [
        ...nodes,
        {
          type: "ReferenceFuncNode",
          reference,
          x: block.x,
          y: block.y + 180,
          id: -1,
        },
      ]
    },
    updateNode: (
      state,
      action: PayloadAction<{
        id: NodeId
        updater: (node: AnyNode) => AnyNode
      }>
    ) => {
      state.current.nodes = state.current.nodes.map((b) => {
        if (b.id !== action.payload.id) {
          return b
        }
        return action.payload.updater(b)
      })
    },
    addEdge: (
      state,
      action: PayloadAction<{
        fromId: NodeId
        toId: NodeId
        toIndex: number
      }>
    ) => {
      const edge = action.payload
      if (!_.find(state.current.edges, edge)) {
        state.current.edges = [...state.current.edges, edge]
      }
    },
    removeNode: (state, action: PayloadAction<NodeId>) => {
      state.current.nodes = rejectNode(state.current.nodes)(action.payload)
    },
    removeNodeFromEdges: (state, action: PayloadAction<NodeId>) => {
      const id = action.payload
      state.current.edges = _.reject(
        state.current.edges,
        (e) => e.toId === id || e.fromId === id
      )
    },
    removeEdge: (state, action: PayloadAction<NodeId>) => {
      const fromId = action.payload
      state.current.edges = _.reject(
        state.current.edges,
        (e) => e.fromId === fromId
      )
    },
  },
})

export const {
  setEdges,
  setNodes,
  setEditingNode,
  setPreviewEdge,
  setPreviewNode,
  addFuncNode,
  addVariableNode,
  addEdge,
  updateNode,
  removeNode,
  removeEdge,
  removeNodeFromEdges,
  addNode,
  addReferenceFuncNode,
  dupulicateNode,
} = graphSlice.actions
