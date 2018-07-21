import React from "react"

export type Component<P = any> =
  | React.StatelessComponent<P>
  | React.ComponentClass<P>

export default function getElementType(
  preferredElement: Component<any>,
  defaultElement = "div"
): Component<any> {
  return preferredElement || defaultElement
}
