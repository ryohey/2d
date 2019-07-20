import { NodeId, INode, IEdge } from "./topology/Graph"

export interface BaseNode<T extends string> extends INode {
  type: T
}

export interface ICodeBlock extends BaseNode<"CodeBlock"> {
  name: string
  code: string
  isAsync?: boolean
  x: number
  y: number
}

export interface IReferenceBlock extends BaseNode<"ReferenceBlock"> {
  reference: NodeId
  x: number
  y: number
}

export const isCodeBlock = (node: AnyNode): node is ICodeBlock =>
  node.type === "CodeBlock"
export const isReferenceBlock = (node: AnyNode): node is IReferenceBlock =>
  node.type === "ReferenceBlock"

export type AnyBlock = ICodeBlock | IReferenceBlock
export type AnyNode = AnyBlock

export interface DisplayBlock extends ICodeBlock {
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
