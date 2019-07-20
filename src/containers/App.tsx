import React, { SFC, useState } from "react"
import { observer } from "mobx-react"
import { Stage as _Stage } from "./Stage"
import { GraphStore } from "../stores/GraphStore"
import { CodeStore } from "../stores/CodeStore"
import buildCode from "../helpers/buildCode"
import { exampleGraph } from "../helpers/exampleGraph"
import exampleCodes from "../helpers/exampleCodes"

import "./App.css"
import { HelpModal } from "../components/HelpModal"
import { ToolBox } from "./ToolBox"
import { Toolbar } from "./Toolbar"

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

  return (
    <div className="App">
      <Toolbar
        graphStore={graphStore}
        onClickHelp={() => setIsHelpModalOpen(true)}
      />
      <div className="main">
        <ToolBox graphStore={graphStore} codeStore={codeStore} />
        <div className="content">
          <Stage graphStore={graphStore} />
          <CodeOutput graphStore={graphStore} />
        </div>
      </div>
      <HelpModal
        isOpen={isHelpModalOpen}
        close={() => setIsHelpModalOpen(false)}
      />
    </div>
  )
}
