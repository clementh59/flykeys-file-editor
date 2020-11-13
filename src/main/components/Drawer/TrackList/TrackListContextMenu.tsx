import { Menu, MenuItem } from "@material-ui/core"
import React, { FC } from "react"
import { IPoint } from "../../../../common/geometry"

export const useContextMenu = () => {
  const [state, setState] = React.useState({
    mouseX: 0,
    mouseY: 0,
    isOpen: false,
  })

  const onContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setState({
      mouseX: e.clientX - 2,
      mouseY: e.clientY - 4,
      isOpen: true,
    })
  }

  const handleClose = () => {
    setState({ ...state, isOpen: false })
  }

  return {
    onContextMenu,
    menuProps: {
      handleClose,
      isOpen: state.isOpen,
      position: { x: state.mouseX, y: state.mouseY },
    },
  }
}

export interface TrackListContextMenuProps {
  isOpen: boolean
  position: IPoint
  onClickDelete: () => void
  onClickMainDroite: () => void
  onClickMainGauche: () => void
  handleClose: () => void
}

export const TrackListContextMenu: FC<TrackListContextMenuProps> = ({
  isOpen,
  position,
  onClickDelete,
  onClickMainDroite,
  onClickMainGauche,
  handleClose,
}) => {
  return (
    <Menu
      keepMounted
      open={isOpen}
      onClose={handleClose}
      anchorReference="anchorPosition"
      anchorPosition={{ top: position.y, left: position.x }}
    >
      <MenuItem
        onClick={(e) => {
          e.stopPropagation()
          onClickMainDroite()
          handleClose()
        }}
      >
        C'est la main droite
      </MenuItem>
      <MenuItem
        onClick={(e) => {
          e.stopPropagation()
          onClickMainGauche()
          handleClose()
        }}
      >
        C'est la main gauche
      </MenuItem>
      <MenuItem
        onClick={(e) => {
          e.stopPropagation()
          onClickDelete()
          handleClose()
        }}
      >
        Delete Track
      </MenuItem>
    </Menu>
  )
}
