import React, { SFC } from "react"

import f from "./helpers/flatJoin"
import e from "./helpers/getElementType"

import "./Icon.css"
import "mdi/css/materialdesignicons.css"

export interface IconProps {
  component?: any
  name: string
  className?: string
}

const Icon: SFC<IconProps> = ({ component, name, className }) => {
  const ElementType = e(component)
  return <ElementType className={f("Icon", "mdi", `mdi-${name}`, className)} />
}

export default Icon
