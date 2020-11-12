import React, { FC, useCallback, useMemo } from "react"
import styled from "styled-components"
import HandColorItem from "./ColorItem"
import { LeftHandColor, RightHandColor } from "../../../Constants"
import { useStores } from "../../../hooks/useStores"

export interface HandColorControlProps {}

const Parent = styled.div`
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`

const HandColorControl: FC<HandColorControlProps> = ({}: HandColorControlProps) => {

  return (
    <Parent>
      <HandColorItem
        id={1}
        selected={true}
        color={LeftHandColor}
        text="Main droite"
      />
      <HandColorItem
        id={1}
        selected={false}
        color={RightHandColor}
        text="Main gauche"
      />
    </Parent>
  )
}

export default HandColorControl;
