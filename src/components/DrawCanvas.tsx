import React, { FC, useState } from "react"

export interface DrawCanvasProps {
  draw: (ctx: CanvasRenderingContext2D) => void
  width: number
  height: number
}

export const DrawCanvas: FC<DrawCanvasProps> = ({ draw, width, height }) => {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)

  if (canvas !== null) {
    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext("2d")
    if (ctx) {
      draw(ctx)
    }
  }

  return <canvas ref={setCanvas} width={width} height={height} />
}
