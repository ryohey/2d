export type NodeId = number

export interface INode<T extends string> {
  id: NodeId
  type: T
}

export interface ICodeBlock extends INode<"CodeBlock"> {
  id: NodeId
  name: string
  code: string
  isAsync?: boolean
  x: number
  y: number
}

export interface IReferenceBlock extends INode<"ReferenceBlock"> {
  reference: NodeId
  x: number
  y: number
}

export const isCodeBlock = (node: AnyNode): node is ICodeBlock =>
  node.type === "CodeBlock"
export const isReferenceBlock = (node: AnyNode): node is IReferenceBlock =>
  node.type === "ReferenceBlock"

export interface IVariable extends INode<"Variable"> {
  value: any
}

export type AnyBlock = ICodeBlock | IReferenceBlock
export type AnyNode = AnyBlock | IVariable

export interface DisplayBlock extends ICodeBlock {
  linked: boolean
  inputNames: string[]
}

export interface IPoint {
  x: number
  y: number
}

export interface IEdge {
  fromId: NodeId
  toId: NodeId
  toIndex: number
}

export type PreviewEdge = Pick<IEdge, "fromId"> & {
  toPosition: IPoint
}

export interface IGraph {
  nodes: AnyNode[]
  edges: IEdge[]
}
