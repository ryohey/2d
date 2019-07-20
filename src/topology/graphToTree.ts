import { INode, IEdge } from "./Graph"
import { ITree } from "./Tree"

const getRootNodes = <Node extends INode, Edge extends IEdge>(
  nodes: Node[],
  edges: Edge[]
): Node[] =>
  nodes.filter(
    node =>
      edges.filter(edge => edge.fromId === node.id).length === 0 &&
      edges.filter(edge => edge.toId === node.id).length > 0
  )

const makeTree = <Node extends INode, Edge extends IEdge>(
  nodes: Node[],
  edges: Edge[],
  rootNode: Node
): ITree<Node> => {
  const children = edges
    .filter(edge => edge.toId === rootNode.id)
    .map(edge => {
      const childNodes = nodes.filter(node => node.id === edge.fromId)
      if (childNodes.length === 0) {
        throw new Error(`node id ${edge.fromId} is not exist`)
      }
      if (childNodes.length > 1) {
        throw new Error(`There are multiple nodes for id ${edge.fromId}`)
      }
      const childNode = childNodes[0]
      return makeTree(nodes, edges, childNode)
    })

  return {
    value: rootNode,
    children
  }
}

export const graphToTree = <Node extends INode, Edge extends IEdge>(
  nodes: Node[],
  edges: Edge[]
): ITree<Node>[] =>
  getRootNodes(nodes, edges).map(n => makeTree(nodes, edges, n))
