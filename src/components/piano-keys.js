import React, { PropTypes } from "react"
import Theme from "../Theme"
import { noteNameWithOctString } from "../note-number-string"
import DrawCanvas from "./draw-canvas"
import pureRender from "../hocs/pure-render"

function drawBorder(ctx, width, height) {
  ctx.lineWidth = 1
  ctx.strokeStyle = Theme.dividerColor
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(width, 0)
  ctx.closePath()
  ctx.stroke()
}

function drawBlackKey(ctx, width, height) {
  const innerWidth = width * 0.64
  const middle = Math.round(height / 2)

  ctx.fillStyle = Theme.textColor
  ctx.fillRect(0, 0, innerWidth, height)

  ctx.lineWidth = 1
  ctx.strokeStyle = Theme.dividerColor
  ctx.beginPath()
  ctx.moveTo(innerWidth, middle)
  ctx.lineTo(width, middle)
  ctx.closePath()
  ctx.stroke()
}

function drawLabel(ctx, width, height, keyNum) {
  const x = width - 5
  ctx.textAlign = "right"
  ctx.textBaseline = "middle"
  ctx.font = `12px ${Theme.canvasFont}`
  ctx.fillStyle = Theme.secondaryTextColor
  ctx.fillText(noteNameWithOctString(keyNum), x, height / 2)
}

function drawKeys(ctx, width, keyHeight, numberOfKeys) {
  ctx.save()
  ctx.translate(0, 0.5)
  
  drawBorder(ctx, width, keyHeight)

  // 0: white, 1: black
  const colors = [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0]
  for (let i = 0; i < numberOfKeys; i++) {
    const isBlack = colors[i % colors.length] != 0
    const bordered = (i % 12 == 4) || (i % 12 == 11)
    const y = (numberOfKeys - i - 1) * keyHeight
    ctx.save()
    ctx.translate(0, y)
    if (isBlack) {
      drawBlackKey(ctx, width, keyHeight)
    } else if (bordered) {
      drawBorder(ctx, width, keyHeight)
    }
    const isKeyC = i % 12 == 0
    if (isKeyC) {
      drawLabel(ctx, width, keyHeight, i)
    }
    ctx.restore()
  }

  ctx.restore()
}

function PianoKeys(props) {
  function draw(ctx) {
    const { width, height } = ctx.canvas
    ctx.clearRect(0, 0, width, height)
    drawKeys(ctx, props.width, props.keyHeight, props.numberOfKeys)
  }

  return <DrawCanvas
    draw={draw}
    className="PianoKeys"
    width={props.width}
    height={props.keyHeight * props.numberOfKeys}
  />
}

PianoKeys.propTypes = {
  width: PropTypes.number.isRequired,
  keyHeight: PropTypes.number.isRequired,
  numberOfKeys: PropTypes.number.isRequired
}

export default pureRender(PianoKeys)
