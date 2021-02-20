import { observer } from "mobx-react"
import React, { FC, useState } from "react"
import { DragContainer } from "../components/Drag"
import { HelpModal } from "../components/HelpModal"
import buildCode from "../helpers/buildCode"
import { useMouseHandler } from "../helpers/createMouseHandler"
import { exampleGraph } from "../helpers/exampleGraph"
import { GraphStore } from "../stores/GraphStore"
import "./App.css"
import { Stage as _Stage } from "./Stage"
import { Toolbar } from "./Toolbar"
import { ToolBox } from "./ToolBox"

const graphStore = new GraphStore()

exampleGraph.nodes.forEach((b) => graphStore.addNode(b))
graphStore.edges = exampleGraph.edges

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

export const App: FC<{}> = () => {
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false)
  const mouseHandler = useMouseHandler(graphStore)

  return (
    <div className="App">
      <Toolbar
        graphStore={graphStore}
        onClickHelp={() => setIsHelpModalOpen(true)}
      />
      <DragContainer {...mouseHandler} className="main">
        <div className="content">
          <ToolBox />
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
