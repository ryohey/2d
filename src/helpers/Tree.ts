import { AnyNode, IEdge } from "../types"

export interface TreeNode<T> {
  value: T
  children: TreeNode<T>[]
}

// 木構造の末端からまとめあげる
export const foldTree = <T, S>(
  tree: TreeNode<T>,
  fn: (node: TreeNode<T>, children: S[]) => S
): S => {
  return fn(tree, tree.children.map(c => foldTree(c, fn)))
}

const getRootNodes = (nodes: AnyNode[], edges: IEdge[]): AnyNode[] =>
  nodes.filter(
    node =>
      edges.filter(edge => edge.fromId === node.id).length === 0 &&
      edges.filter(edge => edge.toId === node.id).length > 0
  )

const makeTree = (
  nodes: AnyNode[],
  edges: IEdge[],
  rootNode: AnyNode,
  edge: IEdge | undefined = undefined
): TreeNode<AnyNode & { toIndex: number | null }> => {
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
      return makeTree(nodes, edges, childNode, edge)
    })

  const value = {
    ...rootNode,
    toIndex: edge !== undefined ? edge.toIndex : null
  }

  return {
    value,
    children
  }
}

export const makeTrees = (
  nodes: AnyNode[],
  edges: IEdge[]
): TreeNode<AnyNode & { toIndex: number | null }>[] =>
  getRootNodes(nodes, edges).map(n => makeTree(nodes, edges, n))
