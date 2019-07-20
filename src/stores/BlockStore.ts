import _ from "lodash"
import { action, observable } from "mobx"
import { createContext } from "react"
import { createFunction, getParamNames } from "../helpers/functionHelper"
import {
  AnyBlock,
  DisplayBlock,
  ICodeBlock,
  IEdge,
  isCodeBlock,
  isReferenceBlock,
  NodeId,
  PreviewEdge
} from "../types"

export interface IBlockStore {
  blocks: AnyBlock[]
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
  @observable blocks: AnyBlock[] = []
  @observable edges: IEdge[] = []

  @observable previewBlock: DisplayBlock | null = null
  @observable previewEdge: PreviewEdge | null = null

  getBlock(id: NodeId): AnyBlock {
    return this.blocks.filter(b => b.id === id)[0]
  }

  getOriginBlock(id: NodeId): ICodeBlock {
    const block = this.getBlock(id)
    if (isReferenceBlock(block)) {
      return this.getOriginBlock(block.reference)
    }
    if (isCodeBlock(block)) {
      return block
    }
    throw new Error("origin block is not exist")
  }

  /*
    表示用の block オブジェクトを取得する
    inputLength など表示に必要なプロパティが追加されている
    link 先を取得しなくても表示できるように name プロパティなども追加する
  */
  getDisplayBlock(id: NodeId): DisplayBlock {
    const block = this.getBlock(id)
    const origin = this.getOriginBlock(id)
    return {
      id: block.id,
      type: "CodeBlock",
      x: block.x,
      y: block.y,
      linked: isReferenceBlock(block),
      name: origin.name,
      isAsync: origin.isAsync,
      code: origin.code,
      inputNames: this.getBlockInputNames(id)
    }
  }

  allDisplayBlocks(): DisplayBlock[] {
    return this.blocks.map(b => this.getDisplayBlock(b.id))
  }

  @action
  addBlock(block: AnyBlock) {
    this.blocks = [
      ...this.blocks,
      {
        ...block,
        id: this.lastBlockId() + 1
      }
    ]
  }

  getBlockInputNames(id: NodeId) {
    let block = this.getBlock(id)
    if (isReferenceBlock(block)) {
      block = this.getBlock(block.reference)
    }
    if (!isCodeBlock(block)) {
      return []
    }
    const func = createFunction(block.code)
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
      .filter(isReferenceBlock)
      .filter(b => b.reference === id)
      .forEach(b => this.removeBlock(b.id))
  }

  lastBlockId() {
    const maxId = _.max(this.blocks.map(b => b.id))
    return maxId !== undefined ? maxId : -1
  }

  @action
  updateBlock(id: NodeId, updater: (block: AnyBlock) => AnyBlock) {
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
