import React, { SFC, useState } from "react"
import { observer } from "mobx-react"
import { Stage as _Stage } from "./Stage"
import { GraphStore } from "../stores/GraphStore"
import { CodeStore, Code } from "../stores/CodeStore"
import buildCode from "../helpers/buildCode"
import { exampleGraph } from "../helpers/exampleGraph"
import exampleCodes from "../helpers/exampleCodes"

import "./App.css"
import { HelpModal } from "../components/HelpModal"
import { ToolBox } from "./ToolBox"
import { Toolbar } from "./Toolbar"
import {
  DragContainer,
  DragBeginEvent,
  DragMoveEvent,
  DragEndEvent
} from "../components/Drag"

const graphStore = new GraphStore()
const codeStore = new CodeStore()

exampleGraph.nodes.forEach(b => graphStore.addNode(b))
graphStore.edges = exampleGraph.edges
codeStore.codes = exampleCodes()

function _CodeOutput({ graphStore }: { graphStore: GraphStore }) {
  const code = buildCode(graphStore)
  return (
    <div className="CodeOutput">
      <pre>{code}</pre>
    </div>
  )
}

const Stage = observer(_Stage)
const CodeOutput = observer(_CodeOutput)

export const App: SFC<{}> = () => {
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false)

  const onMouseDownStage = (e: DragBeginEvent) => {
    if (e.start === null) {
      return
    }

    if (e.start.type === "ToolBoxItem") {
      const code: Code = e.start.code
      graphStore.previewNode = {
        ...code,
        id: 0,
        type: "FuncNode",
        linked: false,
        x: e.originEvent.clientX,
        y: e.originEvent.clientY
      }
    }
  }

  const onMouseMoveStage = (e: DragMoveEvent) => {
    if (e.start === null) {
      return
    }
    if (e.start.type === "FuncNodeHeader") {
      graphStore.updateNode(e.start.node.id, b => ({
        ...b,
        x: e.movement.x + e.start.node.x,
        y: e.movement.y + e.start.node.y
      }))
    }

    if (e.start.type === "ToolBoxItem") {
      const { previewNode } = graphStore
      if (previewNode) {
        graphStore.previewNode = {
          ...previewNode,
          x: e.startPosition.x + e.movement.x,
          y: e.startPosition.y + e.movement.y
        }
      }
    }
  }

  const onMouseUpStage = (e: DragEndEvent) => {
    console.log(e)
    if (e.start !== null) {
      if (e.end !== null) {
        if (
          e.start.type === "FuncNodeOutput" &&
          e.end.type === "FuncNodeInput"
        ) {
          graphStore.addEdge(e.start.node.id, e.end.node.id, e.end.index)
        }
        // 同じポートでドラッグした場合はエッジを削除
        if (
          e.start.type === "FuncNodeOutput" &&
          e.end.type === "FuncNodeOutput" &&
          e.start.node.id === e.end.node.id
        ) {
          graphStore.removeEdge(e.start.node.id)
        }
      } else {
        if (e.start.type === "ToolBoxItem") {
          const { previewNode } = graphStore
          if (previewNode) {
            graphStore.previewNode = null
            graphStore.addNode(previewNode)
          }
        }
      }
    }
  }

  return (
    <div className="App">
      <Toolbar
        graphStore={graphStore}
        onClickHelp={() => setIsHelpModalOpen(true)}
      />
      <DragContainer
        onMouseDown={onMouseDownStage}
        onMouseUp={onMouseUpStage}
        onMouseDragMove={onMouseMoveStage}
        className="main"
      >
        <ToolBox codeStore={codeStore} />
        <div className="content">
          <Stage graphStore={graphStore} />
          <CodeOutput graphStore={graphStore} />
        </div>
      </DragContainer>
      <HelpModal
        isOpen={isHelpModalOpen}
        close={() => setIsHelpModalOpen(false)}
      />
    </div>
  )
}
