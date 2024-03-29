import React, { FC } from "react"
import { IPoint } from "../../../../common/geometry"
import { CanvasDrawStyle } from "../../../style"
import Stage, { StageProps } from "../../Stage/Stage"
import { GraphAxis } from "./GraphAxis"
import "./LineGraph.css"
import LineGraphItem from "./LineGraphItem"

export interface LineGraphItemData extends IPoint {
  id: number
}

export type LineGraphProps = Omit<StageProps<LineGraphItem>, "items"> & {
  items: LineGraphItemData[]
  onClickAxis: (value: number) => void
  className: string
  lineWidth?: number
  axis: number[]
  color: CanvasDrawStyle
}

const LineGraph: FC<LineGraphProps> = ({
  width,
  height,
  scrollLeft = 0,
  items,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onClickAxis,
  className,
  lineWidth = 1,
  axis,
  color,
}) => {
  const right = scrollLeft + width
  const items_ = items.map(({ id, x, y }, i) => {
    const next = items[i + 1]
    const nextX = next ? next.x : right // 次がなければ右端まで描画する
    return new LineGraphItem(
      id,
      x,
      y,
      y,
      nextX - x,
      height,
      color,
      color,
      lineWidth
    )
  })

  return (
    <div className={`PianoControl LineGraph ${className}`}>
      <GraphAxis axis={axis} onClick={onClickAxis} />
      <Stage
        className="Graph"
        items={items_}
        width={width}
        height={height}
        scrollLeft={scrollLeft}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
      />
    </div>
  )
}

export default React.memo(LineGraph)
