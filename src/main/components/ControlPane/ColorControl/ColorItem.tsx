import isEqual from "lodash/isEqual"
import React, { FC } from "react"
import { Button, styled } from "@material-ui/core"
import Color from "color"
import { useStores } from "../../../hooks/useStores"
import { changeNoteColor } from "../../../actions"

export interface HandColorItemProps {
  id: number
  selected: boolean
  color: Color,
  text: string
}

export interface HandColorItemEvent {
  originalEvent: PIXI.InteractionEvent
  item: HandColorItemProps
}

const HandColorItem: FC<HandColorItemProps> = (props) => {
  const { color, selected, text } = props

  const { rootStore } = useStores()

  const onButtonClick = () => {
    // I change the color of all the selected notes
    changeNoteColor(rootStore)(rootStore.pianoRollStore.selection.noteIds,color);
    // I set the default color to be the selected one
    rootStore.settingsStore.defaultNoteColor = color;
  }

  const MySelectedButton = styled(Button)({
    border: 0,
    borderRadius: 3,
    color: "white",
    height: 48,
    padding: "0 30px",
    margin: "auto",
    background: color.hex(),
    boxShadow: `0 3px 5px 2px rgba(${color.red()}, ${color.green()}, ${color.blue()}, .3)`
  })

  const MyUnselectedButton = styled(Button)({
    borderRadius: 3,
    height: 48,
    color: "white",
    padding: "0 30px",
    margin: "auto",
    borderColor: color.hex()
  })

  if (selected)
    return <MySelectedButton variant="contained" onClick={() => {
      onButtonClick()
    }}>{text}</MySelectedButton>
  return <MyUnselectedButton variant="outlined" onClick={() => {
    onButtonClick()
  }}>{text}</MyUnselectedButton>
}

const areEqual = (props: HandColorItemProps, nextProps: HandColorItemProps) => {
  return (
    props.id === nextProps.id &&
    isEqual(props.color, nextProps.color) &&
    props.selected === nextProps.selected
  )
}

export default React.memo(HandColorItem, areEqual)
