import React, { FC } from "react"
import { useRecoilValue } from "recoil"
import { DragTrigger } from "../components/Drag"
import Icon from "../components/Icon"
import { codeState } from "../stores/CodeStore"

export const ToolBox: FC = () => {
  const codes = useRecoilValue(codeState)

  return (
    <div className="ToolBox">
      <div className="header">toolbox</div>
      {codes.map((c, i) => (
        <DragTrigger
          key={i}
          className="item"
          data={{
            code: c,
            type: "ToolBoxItem",
          }}
        >
          <div className="name">{c.name}</div>
          <Icon name="arrow-top-right" />
        </DragTrigger>
      ))}
    </div>
  )
}
