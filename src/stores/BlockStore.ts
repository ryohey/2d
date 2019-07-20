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
  PreviewEdge,
  AnyNode
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
  @observable nodes: AnyNode[] = []
  @observable edges: IEdge[] = []

  @observable previewBlock: DisplayBlock | null = null
  @observable previewEdge: PreviewEdge | null = null

  getNode(id: NodeId): AnyNode {
    return this.nodes.filter(b => b.id === id)[0]
  }

  getBlock(id: NodeId): AnyBlock {
    const node = this.getNode(id)
    if (!(isCodeBlock(node) || isReferenceBlock(node))) {
      throw new Error("node is not block")
    }
    return node
  }

  getOriginBlock(id: NodeId): ICodeBlock {
    const block = this.getNode(id)
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
    const block = this.getNode(id)
    if (!(isCodeBlock(block) || isReferenceBlock(block))) {
      throw new Error(`id ${id} is not block`)
    }
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
    return this.nodes.map(b => this.getDisplayBlock(b.id))
  }

  @action
  addNode(block: AnyNode) {
    this.nodes = [
      ...this.nodes,
      {
        ...block,
        id: this.lastBlockId() + 1
      }
    ]
  }

  getBlockInputNames(id: NodeId) {
    let block = this.getNode(id)
    if (isReferenceBlock(block)) {
      block = this.getNode(block.reference)
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
    while (_.find(this.nodes, { name })) {
      name = `${requiredName}${count}`
      count++
    }
    return name
  }

  @action
  removeBlock(id: NodeId) {
    this.nodes = _.reject(this.nodes, b => b.id === id)
    this.edges = _.reject(this.edges, e => e.toId === id || e.fromId === id)
    this.nodes
      .filter(isReferenceBlock)
      .filter(b => b.reference === id)
      .forEach(b => this.removeBlock(b.id))
  }

  lastBlockId() {
    const maxId = _.max(this.nodes.map(b => b.id))
    return maxId !== undefined ? maxId : -1
  }

  @action
  updateNode(id: NodeId, updater: (node: AnyNode) => AnyNode) {
    this.nodes = this.nodes.map(b => {
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
