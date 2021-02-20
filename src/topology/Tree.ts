export interface ITree<T> {
  value: T
  children: ITree<T>[]
}

// 木構造の末端からまとめあげる
export const foldTree = <T, S>(
  tree: ITree<T>,
  fn: (node: ITree<T>, children: S[]) => S
): S => {
  return fn(
    tree,
    tree.children.map((c) => foldTree(c, fn))
  )
}
