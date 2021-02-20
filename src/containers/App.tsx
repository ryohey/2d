import React, { FC, useState } from "react"
import { DragContainer } from "../components/Drag"
import { HelpModal } from "../components/HelpModal"
import buildCode from "../helpers/buildCode"
import { useMouseHandler } from "../helpers/createMouseHandler"
import { useAppSelector } from "../hooks"
import "./App.css"
import { Stage } from "./Stage"
import { Toolbar } from "./Toolbar"
import { ToolBox } from "./ToolBox"

function CodeOutput() {
  const { edges, nodes } = useAppSelector((state) => state.graph.current)
  const code = buildCode({ edges, nodes })
  return (
    <div className="CodeOutput">
      <pre>{code}</pre>
    </div>
  )
}

export const App: FC<{}> = () => {
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false)
  const mouseHandler = useMouseHandler()

  return (
    <div className="App">
      <Toolbar onClickHelp={() => setIsHelpModalOpen(true)} />
      <DragContainer {...mouseHandler} className="main">
        <div className="content">
          <ToolBox />
          <Stage />
          <CodeOutput />
        </div>
      </DragContainer>
      <HelpModal
        isOpen={isHelpModalOpen}
        close={() => setIsHelpModalOpen(false)}
      />
    </div>
  )
}
