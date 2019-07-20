import React, { SFC } from "react"
import { GraphStore } from "../stores/GraphStore"
import { CodeStore } from "../stores/CodeStore"
import Icon from "../components/Icon"

export const ToolBox: SFC<{ graphStore: GraphStore; codeStore: CodeStore }> = ({
  graphStore,
  codeStore
}) => (
  <div className="ToolBox">
    <div className="header">toolbox</div>
    {codeStore.codes.map((c, i) => (
      <div
        key={i}
        className="item"
        onMouseDown={e => {
          e.stopPropagation()
          const parent = e.currentTarget.parentElement
          if (parent == null) {
            return
          }
          const bounds = parent.getBoundingClientRect()
          graphStore.previewNode = {
            ...c,
            x: e.clientX - bounds.width,
            y: e.clientY - bounds.top,
            inputNames: c.inputLength
          }
        }}
      >
        <div className="name">{c.name}</div>
        <Icon name="arrow-top-right" />
      </div>
    ))}
  </div>
)
