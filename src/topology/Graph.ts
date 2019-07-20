export type NodeId = number

export interface INode {
  id: NodeId
}

export interface IEdge {
  fromId: NodeId
  toId: NodeId
}

export interface IGraph<Node extends INode, Edge extends IEdge> {
  nodes: Node[]
  edges: Edge[]
}
