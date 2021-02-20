import React, { SFC, MouseEvent } from "react"
import styled from "styled-components"
import { IPoint } from "../types"

export interface DropDownItem {
  name: string
  onClick: (e: MouseEvent<any>) => void
}

export interface DropDownMenuProps {
  position?: IPoint
  items: DropDownItem[]
  onRequestClose: () => void
}

const Container = styled.div`
  position: absolute;
  background: var(--background-color);
  padding: 0.5em 0em;
  font-size: 90%;
  width: 10em;
  z-index: 100;
  box-shadow: 0 2px 9px rgba(0, 0, 0, 0.24);

  > div {
    padding: 0.5em;

    &:hover {
      background: var(--secondary-background-color);
    }
  }
`

export const DropDownMenu: SFC<DropDownMenuProps> = ({
  items,
  onRequestClose,
  position,
}) => {
  return (
    <Container
      style={
        position !== undefined ? { left: position.x, top: position.y } : {}
      }
    >
      {items.map((item, i) => (
        <div
          onClick={(e) => {
            onRequestClose()
            item.onClick(e)
          }}
          key={i}
        >
          {item.name}
        </div>
      ))}
    </Container>
  )
}
