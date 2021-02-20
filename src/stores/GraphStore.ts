import _ from "lodash"
import { action, observable, makeObservable } from "mobx";
import { createFunction, getParamNames } from "../helpers/functionHelper"
import {
  AnyFuncNode,
  DisplayFuncNode,
  IFuncNode,
  isFuncNode,
  isReferenceFuncNode,
  PreviewEdge,
  AnyNode,
  FuncEdge,
  IPoint
} from "../types"
import { NodeId } from "../topology/Graph"
import { notEmpty } from "../helpers/typeHelper"

interface ClickData {
  type: string
  id: NodeId
  start?: IPoint
  startOffset?: IPoint
}

export class GraphStore {
  nodes: AnyNode[] = [];
  edges: FuncEdge[] = [];

  previewNode: DisplayFuncNode | null = null;
  previewEdge: PreviewEdge | null = null;

  editingNode: AnyNode | null = null;

  private dragInfo: ClickData | null = null

  constructor() {
    makeObservable(this, {
      nodes: observable,
      edges: observable,
      previewNode: observable,
      previewEdge: observable,
      editingNode: observable,
      addNode: action,
      dupulicateNode: action,
      createReferenceFuncNode: action,
      removeNode: action,
      updateNode: action,
      addEdge: action,
      removeEdge: action
    });
  }

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

  addNode(node: AnyNode) {
    this.nodes = [
      ...this.nodes,
      {
        ...node,
        id: this.lastNodeId() + 1
      }
    ]
  }

  dupulicateNode(id: NodeId) {
    const block = this.getFuncNode(id)
    this.addNode({
      ...block,
      y: block.y + 180
    })
  }

  createReferenceFuncNode(id: NodeId) {
    const block = this.getFuncNode(id)
    const reference = isReferenceFuncNode(block) ? block.reference : id
    this.addNode({
      type: "ReferenceFuncNode",
      reference,
      x: block.x,
      y: block.y + 180,
      id: -1
    })
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
    const names = getParamNames(func)
    return names
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

  updateNode(id: NodeId, updater: (node: AnyNode) => AnyNode) {
    this.nodes = this.nodes.map(b => {
      if (b.id !== id) {
        return b
      }
      return updater(b)
    })
  }

  addEdge(fromId: NodeId, toId: NodeId, toIndex: number) {
    const edge = { fromId, toId, toIndex }
    if (!_.find(this.edges, edge)) {
      this.edges = [...this.edges, edge]
    }
  }

  removeEdge(fromId: NodeId) {
    this.edges = _.reject(this.edges, e => e.fromId === fromId)
  }

  dragMoveOnStage = (x: number, y: number) => {
    if (this.previewNode) {
      this.previewNode = {
        ...this.previewNode,
        x,
        y
      }
      return
    }

    if (this.dragInfo === null) {
      return
    }

    switch (this.dragInfo.type) {
      case "edge": {
        this.previewEdge = {
          fromId: this.dragInfo.id,
          toPosition: { x, y }
        }
      }
    }
  }

  endDragOnStage = () => {
    this.previewEdge = null
  }

  addNewFuncNode = (x: number, y: number) => {
    this.addNode({
      type: "FuncNode",
      x,
      y,
      name: "func",
      code: `x => x`,
      isAsync: false,
      id: -1
    })
  }

  addNewVariableNode = (x: number, y: number) => {
    this.addNode({
      type: "VariableNode",
      x,
      y,
      name: "variable",
      id: -1,
      value: ""
    })
  }
}
