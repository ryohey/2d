import { NodeId, INode, IEdge } from "./topology/Graph"

export interface BaseNode<T extends string> extends INode {
  type: T
}

export interface IFuncNode extends BaseNode<"FuncNode"> {
  name: string
  code: string
  isAsync?: boolean
  x: number
  y: number
}

export interface IReferenceFuncNode extends BaseNode<"ReferenceFuncNode"> {
  reference: NodeId
  x: number
  y: number
}

export const isFuncNode = (node: AnyNode): node is IFuncNode =>
  node.type === "FuncNode"
export const isReferenceFuncNode = (
  node: AnyNode
): node is IReferenceFuncNode => node.type === "ReferenceFuncNode"

export type AnyFuncNode = IFuncNode | IReferenceFuncNode

export interface IVariableNode extends BaseNode<"VariableNode"> {
  name: string
  value: any
  x: number
  y: number
}
export const isVariableNode = (node: AnyNode): node is IVariableNode =>
  node.type === "VariableNode"

export type AnyNode = AnyFuncNode | IVariableNode

export interface DisplayFuncNode extends IFuncNode {
  linked: boolean
  inputNames: string[]
}

export interface IPoint {
  x: number
  y: number
}

export interface PreviewEdge {
  fromId: NodeId
  toPosition: IPoint
}

export interface FuncEdge extends IEdge {
  toIndex: number
}
