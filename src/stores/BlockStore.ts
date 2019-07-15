import { action, observable } from "mobx"
import _ from "lodash"
import { IEdge, IBlock, BlockId, DisplayBlock, PreviewEdge } from "../types"
import { Optional } from "../helpers/typeHelper"
import { createFunction } from "../helpers/functionHelper"

export default class BlockStore {
  @observable blocks: IBlock[] = []
  @observable edges: IEdge[] = []

  @observable previewBlock: DisplayBlock | null = null
  @observable previewEdge: PreviewEdge | null = null

  getBlock(id: BlockId): IBlock {
    return this.blocks.filter(b => b.id === id)[0]
  }

  /*
    表示用の block オブジェクトを取得する
    inputLength など表示に必要なプロパティが追加されている
    link 先を取得しなくても表示できるように name プロパティなども追加する
  */
  getDisplayBlock(id: BlockId): DisplayBlock {
    const block = this.getBlock(id)
    const linked = block.link ? this.getBlock(block.link) : undefined
    return {
      ...block,
      linked: block.link !== undefined,
      name: (linked || block).name,
      isAsync: (linked || block).isAsync,
      code: linked ? "" : block.code,
      inputLength: this.getBlockInputLength(id)
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

  getBlockInputLength(id: BlockId) {
    let block = this.getBlock(id)
    if (block.link) {
      block = this.getBlock(block.link)
    }
    const code = block.code
    if (code === undefined) {
      return 0
    }
    const func = createFunction(code)
    return func.length
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
  removeBlock(id: BlockId) {
    this.blocks = _.reject(this.blocks, b => b.id === id)
    this.edges = _.reject(this.edges, e => e.toId === id || e.fromId === id)
    this.blocks.filter(b => b.link === id).forEach(b => this.removeBlock(b.id))
  }

  lastBlockId() {
    const maxId = _.max(this.blocks.map(b => b.id))
    return maxId !== undefined ? maxId : -1
  }

  @action
  updateBlock(id: BlockId, updater: (block: IBlock) => IBlock) {
    this.blocks = this.blocks.map(b => {
      if (b.id !== id) {
        return b
      }
      return updater(b)
    })
  }

  @action
  addEdge(fromId: BlockId, toId: BlockId, toIndex: number) {
    const edge: IEdge = { fromId, toId, toIndex }
    if (!_.find(this.edges, edge)) {
      this.edges = [...this.edges, edge]
    }
  }

  @action
  removeEdge(fromId: BlockId) {
    this.edges = _.reject(this.edges, e => e.fromId === fromId)
  }
}
