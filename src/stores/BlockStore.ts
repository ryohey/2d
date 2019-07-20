import { action, observable } from "mobx"
import _ from "lodash"
import { IEdge, IBlock, NodeId, DisplayBlock, PreviewEdge } from "../types"
import { Optional } from "../helpers/typeHelper"
import { createFunction, getParamNames } from "../helpers/functionHelper"
import { createContext } from "react"

export interface IBlockStore {
  blocks: IBlock[]
  edges: IEdge[]
  previewBlock: DisplayBlock | null
  previewEdge: PreviewEdge | null
}

export const BlockStoreContext = createContext<IBlockStore>({
  blocks: [],
  edges: [],
  previewBlock: null,
  previewEdge: null
})

export class BlockStore {
  @observable blocks: IBlock[] = []
  @observable edges: IEdge[] = []

  @observable previewBlock: DisplayBlock | null = null
  @observable previewEdge: PreviewEdge | null = null

  getBlock(id: NodeId): IBlock {
    return this.blocks.filter(b => b.id === id)[0]
  }

  /*
    表示用の block オブジェクトを取得する
    inputLength など表示に必要なプロパティが追加されている
    link 先を取得しなくても表示できるように name プロパティなども追加する
  */
  getDisplayBlock(id: NodeId): DisplayBlock {
    const block = this.getBlock(id)
    const linked = block.reference ? this.getBlock(block.reference) : undefined
    return {
      ...block,
      linked: block.reference !== undefined,
      name: (linked || block).name,
      isAsync: (linked || block).isAsync,
      code: linked ? "" : block.code,
      inputNames: this.getBlockInputNames(id)
    }
  }

  allDisplayBlocks(): DisplayBlock[] {
    return this.blocks.map(b => this.getDisplayBlock(b.id))
  }

  @action
  addBlock(block: Optional<IBlock, "id">) {
    this.blocks = [
      ...this.blocks,
      {
        ...block,
        id: this.lastBlockId() + 1,
        name: this.getUniqueBlockName(block.name)
      }
    ]
  }

  getBlockInputNames(id: NodeId) {
    let block = this.getBlock(id)
    if (block.reference) {
      block = this.getBlock(block.reference)
    }
    const code = block.code
    if (code === undefined) {
      return []
    }
    const func = createFunction(code)
    return getParamNames(func)
  }

  getUniqueBlockName(requiredName: string = "") {
    let name = requiredName
    let count = 2
    while (_.find(this.blocks, { name })) {
      name = `${requiredName}${count}`
      count++
    }
    return name
  }

  @action
  removeBlock(id: NodeId) {
    this.blocks = _.reject(this.blocks, b => b.id === id)
    this.edges = _.reject(this.edges, e => e.toId === id || e.fromId === id)
    this.blocks
      .filter(b => b.reference === id)
      .forEach(b => this.removeBlock(b.id))
  }

  lastBlockId() {
    const maxId = _.max(this.blocks.map(b => b.id))
    return maxId !== undefined ? maxId : -1
  }

  @action
  updateBlock(id: NodeId, updater: (block: IBlock) => IBlock) {
    this.blocks = this.blocks.map(b => {
      if (b.id !== id) {
        return b
      }
      return updater(b)
    })
  }

  @action
  addEdge(fromId: NodeId, toId: NodeId, toIndex: number) {
    const edge: IEdge = { fromId, toId, toIndex }
    if (!_.find(this.edges, edge)) {
      this.edges = [...this.edges, edge]
    }
  }

  @action
  removeEdge(fromId: NodeId) {
    this.edges = _.reject(this.edges, e => e.fromId === fromId)
  }
}
