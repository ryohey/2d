export type NodeId = number

export interface INode<T extends string> {
  id: NodeId
  type: T
}

export interface ICodeBlock extends INode<"CodeBlock"> {
  id: NodeId
  name?: string
  code?: string
  reference?: NodeId
  isAsync?: boolean
}

export interface IBlock extends ICodeBlock {
  x: number
  y: number
}

export type AnyNode = IBlock

export interface DisplayBlock extends IBlock {
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
