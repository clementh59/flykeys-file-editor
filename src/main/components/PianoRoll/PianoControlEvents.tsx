import { ControllerEvent, ProgramChangeEvent } from "midifile-ts"
import React, { FC } from "react"
import { controllerTypeString as CCNames } from "../../../common/helpers/noteNumberString"
import { TrackEvent, TrackEventRequired } from "../../../common/track"
import "./PianoControlEvents.css"

export type DisplayEvent = TrackEventRequired &
  (ControllerEvent | ProgramChangeEvent)

function displayControlName(e: DisplayEvent): string {
  switch (e.subtype) {
    case "controller": {
      const name = CCNames(e.controllerType)
      return name || "Control"
    }
    case "programChange":
      return "Program Change"
    default:
      return "Control"
  }
}

interface ControlMarkProps {
  group: DisplayEvent[]
  pixelsPerTick: number
  onDoubleClick: () => void
}

const ControlMark: FC<ControlMarkProps> = ({
  group,
  pixelsPerTick,
  onDoubleClick,
}) => {
  const event = group[0]
  return (
    <div
      className="ControlMark"
      style={{ left: event.tick * pixelsPerTick }}
      onDoubleClick={onDoubleClick}
    >
      {displayControlName(event)}
      {group.length > 1 ? ` +${group.length}` : ""}
    </div>
  )
}

/// 重なって表示されないようにひとつのイベントとしてまとめる
function groupControlEvents(
  events: DisplayEvent[],
  tickWindow: number
): DisplayEvent[][] {
  const groups: DisplayEvent[][] = []
  let group: DisplayEvent[] = []
  for (const e of events) {
    if (group.length === 0) {
      group.push(e)
    } else {
      const startTick = events[0].tick
      if (e.tick - startTick < tickWindow) {
        /// 最初のイベントから範囲内ならまとめる
        group.push(e)
      } else {
        /// そうでなければ新しいグループを作る
        groups.push(group)
        group = [e]
      }
    }
  }
  if (group.length > 0) {
    groups.push(group)
  }
  return groups
}

function isDisplayControlEvent(e: TrackEvent): e is DisplayEvent {
  switch ((e as any).subtype) {
    case "controller":
      switch ((e as any).controllerType) {
        case 1: // modulation
        case 7: // volume
        case 10: // panpot
        case 11: // expression
        case 121: // reset all
          return false
        default:
          return true
      }
    case "programChange":
      return true
    default:
      return false
  }
}

export interface PianoControlEventsProps {
  width: number
  events: TrackEvent[]
  scrollLeft: number
  pixelsPerTick: number
  onDoubleClickMark: (group: DisplayEvent[]) => void
}

const PianoControlEvents: FC<PianoControlEventsProps> = ({
  width,
  events,
  scrollLeft,
  pixelsPerTick,
  onDoubleClickMark,
}) => {
  const eventGroups = groupControlEvents(
    events.filter(isDisplayControlEvent),
    120
  )

  return (
    <div className="PianoControlEvents" style={{ width }}>
      <div className="inner">
        <div className="content" style={{ left: -scrollLeft }}>
          {eventGroups.map((g, i) => (
            <ControlMark
              key={i}
              group={g}
              pixelsPerTick={pixelsPerTick}
              onDoubleClick={() => onDoubleClickMark(g)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default PianoControlEvents
