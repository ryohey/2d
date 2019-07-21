import _ from "lodash"
import { action, observable } from "mobx"
import { createContext } from "react"
import { createFunction, getParamNames } from "../helpers/functionHelper"
import {
  AnyFuncNode,
  DisplayFuncNode,
  IFuncNode,
  isFuncNode,
  isReferenceFuncNode,
  PreviewEdge,
  AnyNode,
  FuncEdge
} from "../types"
import { NodeId } from "../topology/Graph"
import { notEmpty } from "../helpers/typeHelper"

export interface IGraphStore {
  nodes: AnyNode[]
  edges: FuncEdge[]
  previewNode: DisplayFuncNode | null
  previewEdge: PreviewEdge | null
}

export const GraphStoreContext = createContext<IGraphStore>({
  nodes: [],
  edges: [],
  previewNode: null,
  previewEdge: null
})

export class GraphStore {
  @observable nodes: AnyNode[] = []
  @observable edges: FuncEdge[] = []

  @observable previewNode: DisplayFuncNode | null = null
  @observable previewEdge: PreviewEdge | null = null

  getNode(id: NodeId): AnyNode {
    return this.nodes.filter(b => b.id === id)[0]
  }

  getFuncNode(id: NodeId): AnyFuncNode {
    const node = this.getNode(id)
    if (!(isFuncNode(node) || isReferenceFuncNode(node))) {
      throw new Error("node is not FuncNode")
    }
    return node
  }

  getOriginFuncNode(id: NodeId): IFuncNode {
    const node = this.getNode(id)
    switch (node.type) {
      case "FuncNode":
        return node
      case "ReferenceFuncNode":
        return this.getOriginFuncNode(node.reference)
      case "VariableNode":
        throw new Error("origin node is not exist")
    }
  }

  /*
    表示用の node オブジェクトを取得する
    inputLength など表示に必要なプロパティが追加されている
    link 先を取得しなくても表示できるように name プロパティなども追加する
  */
  getDisplayNode(id: NodeId): DisplayFuncNode | null {
    const node = this.getNode(id)
    if (!(isFuncNode(node) || isReferenceFuncNode(node))) {
      return null
    }
    const origin = this.getOriginFuncNode(id)
    return {
      id: node.id,
      type: "FuncNode",
      x: node.x,
      y: node.y,
      linked: isReferenceFuncNode(node),
      name: origin.name,
      isAsync: origin.isAsync,
      code: origin.code,
      inputNames: this.getFuncNodeInputNames(id)
    }
  }

  allDisplayNodes(): DisplayFuncNode[] {
    return this.nodes.map(b => this.getDisplayNode(b.id)).filter(notEmpty)
  }

  @action
  addNode(node: AnyNode) {
    this.nodes = [
      ...this.nodes,
      {
        ...node,
        id: this.lastNodeId() + 1
      }
    ]
  }

  getFuncNodeInputNames(id: NodeId) {
    let node = this.getNode(id)
    if (isReferenceFuncNode(node)) {
      node = this.getNode(node.reference)
    }
    if (!isFuncNode(node)) {
      return []
    }
    const func = createFunction(node.code)
    return getParamNames(func)
  }

  getUniqueNodeName(requiredName: string = "") {
    let name = requiredName
    let count = 2
    while (_.find(this.nodes, { name })) {
      name = `${requiredName}${count}`
      count++
    }
    return name
  }

  @action
  removeNode(id: NodeId) {
    this.nodes = _.reject(this.nodes, b => b.id === id)
    this.edges = _.reject(this.edges, e => e.toId === id || e.fromId === id)
    this.nodes
      .filter(isReferenceFuncNode)
      .filter(b => b.reference === id)
      .forEach(b => this.removeNode(b.id))
  }

  lastNodeId() {
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
    const edge = { fromId, toId, toIndex }
    if (!_.find(this.edges, edge)) {
      this.edges = [...this.edges, edge]
    }
  }

  @action
  removeEdge(fromId: NodeId) {
    this.edges = _.reject(this.edges, e => e.fromId === fromId)
  }
}
