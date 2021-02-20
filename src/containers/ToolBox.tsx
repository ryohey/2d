import React, { FC } from "react"
import { DragTrigger } from "../components/Drag"
import Icon from "../components/Icon"
import { useAppSelector } from "../hooks"

export const ToolBox: FC = () => {
  const codes = useAppSelector((state) => state.codes)

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
