import { INode, IEdge, IGraph } from "./Graph"
import { ITree } from "./Tree"

const getRootNodes = <Node extends INode, Edge extends IEdge>(
  graph: IGraph<Node, Edge>
): Node[] =>
  graph.nodes.filter(
    node =>
      graph.edges.filter(edge => edge.fromId === node.id).length === 0 &&
      graph.edges.filter(edge => edge.toId === node.id).length > 0
  )

const makeTree = <Node extends INode, Edge extends IEdge>(
  graph: IGraph<Node, Edge>,
  rootNode: Node
): ITree<Node> => {
  const children = graph.edges
    .filter(edge => edge.toId === rootNode.id)
    .map(edge => {
      const childNodes = graph.nodes.filter(node => node.id === edge.fromId)
      if (childNodes.length === 0) {
        throw new Error(`node id ${edge.fromId} is not exist`)
      }
      if (childNodes.length > 1) {
        throw new Error(`There are multiple nodes for id ${edge.fromId}`)
      }
      const childNode = childNodes[0]
      return makeTree(graph, childNode)
    })

  return {
    value: rootNode,
    children
  }
}

export const graphToTree = <Node extends INode, Edge extends IEdge>(
  graph: IGraph<Node, Edge>
): ITree<Node>[] => getRootNodes(graph).map(n => makeTree(graph, n))
