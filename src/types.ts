export type BlockId = number

export interface ICodeBlock {
  id: BlockId
  name?: string
  code?: string
  reference?: BlockId
  isAsync?: boolean
}

export interface IBlock extends ICodeBlock {
  x: number
  y: number
}

export interface DisplayBlock extends IBlock {
  linked: boolean
  inputLength: number
}

export interface IPoint {
  x: number
  y: number
}

export interface IEdge {
  fromId: BlockId
  toId: BlockId
  toIndex: number
}

export type PreviewEdge = Pick<IEdge, "fromId"> & {
  toPosition: IPoint
}

export interface IGraph {
  blocks: IBlock[]
  edges: IEdge[]
}
