import React, { FC } from "react"
import { DragTrigger } from "../components/Drag"
import Icon from "../components/Icon"
import { CodeStore } from "../stores/CodeStore"

export const ToolBox: FC<{ codeStore: CodeStore }> = ({ codeStore }) => (
  <div className="ToolBox">
    <div className="header">toolbox</div>
    {codeStore.codes.map((c, i) => (
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
