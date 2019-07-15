import React, { SFC, MouseEvent } from "react"

export interface DropDownItem {
  name: string
  onClick: (e: MouseEvent<any>) => void
}

export interface DropDownMenuProps {
  items: DropDownItem[]
  onRequestClose: () => void
}

export const DropDownMenu: SFC<DropDownMenuProps> = ({
  items,
  onRequestClose
}) => {
  return (
    <div className="drop-down">
      {items.map((item, i) => (
        <div
          onClick={e => {
            onRequestClose()
            item.onClick(e)
          }}
          key={i}
        >
          {item.name}
        </div>
      ))}
    </div>
  )
}
