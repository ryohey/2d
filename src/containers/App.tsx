import React, { SFC, useState } from "react"
import { observer } from "mobx-react"
import Icon from "../components/Icon"
import { Stage as _Stage } from "./Stage"
import { BlockStore } from "../stores/BlockStore"
import { CodeStore } from "../stores/CodeStore"
import buildCode from "../helpers/buildCode"
import exampleBlocks from "../helpers/exampleBlocks"
import exampleCodes from "../helpers/exampleCodes"

import "./App.css"
import { HelpModal } from "../components/HelpModal"
import { ToolBox } from "./ToolBox"
import { Toolbar } from "./Toolbar"

const blockStore = new BlockStore()
const codeStore = new CodeStore()

exampleBlocks.blocks.forEach(b => blockStore.addBlock(b))
blockStore.edges = exampleBlocks.edges
codeStore.codes = exampleCodes()

function _CodeOutput({ blockStore }: { blockStore: BlockStore }) {
  const code = buildCode(blockStore.blocks, blockStore.edges)
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
        blockStore={blockStore}
        onClickHelp={() => setIsHelpModalOpen(true)}
      />
      <div className="main">
        <ToolBox blockStore={blockStore} codeStore={codeStore} />
        <div className="content">
          <Stage blockStore={blockStore} />
          <CodeOutput blockStore={blockStore} />
        </div>
      </div>
      <HelpModal
        isOpen={isHelpModalOpen}
        close={() => setIsHelpModalOpen(false)}
      />
    </div>
  )
}
