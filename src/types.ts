export type BlockId = number

export interface IBlock {
  id: BlockId
  x: number
  y: number
  name?: string
  code?: string
  link?: BlockId
  isAsync?: boolean
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
  toPosition?: IPoint
}

export interface IGraph {
  blocks: IBlock[]
  edges: IEdge[]
}
