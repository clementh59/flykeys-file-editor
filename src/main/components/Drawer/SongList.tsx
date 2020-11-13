import { List, ListItem, ListItemText } from "@material-ui/core"
import React, { ChangeEvent, FC } from "react"
import { localized } from "../../../common/localize/localizedString"
import { createSong, openFlykeysFile, openMidiSong, saveFlyKeysFile, saveMidiSong } from "../../actions"
import { useStores } from "../../hooks/useStores"
import { ListHeader } from "./Drawer"

const fileInputID = "OpenButtonInputFile"
const flykeysFileInputID = "OpenFlykeysButtonInputFile"

const FileInput: FC<{
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
}> = ({ onChange, children }) => (
  <>
    <input
      accept="audio/midi"
      style={{ display: "none" }}
      id={fileInputID}
      type="file"
      onChange={onChange}
    />
    <label htmlFor={fileInputID}>{children}</label>
  </>
)

const FileInputFlykeysFiles: FC<{
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
}> = ({ onChange, children }) => (
  <>
    <input
      accept=".txt, .flks"
      style={{ display: "none" }}
      id={flykeysFileInputID}
      type="file"
      onChange={onChange}
    />
    <label htmlFor={flykeysFileInputID}>{children}</label>
  </>
)

export const SongList: FC = () => {
  const { rootStore } = useStores()
  const onClickNew = () => {
    if (
      confirm(localized("confirm-new", "Are you sure you want to continue?"))
    ) {
      createSong(rootStore)()
    }
  }
  const onClickOpen = (e: ChangeEvent<HTMLInputElement>) =>
    openMidiSong(rootStore)(e.currentTarget)
  const onClickOpenFlykeys = (e: ChangeEvent<HTMLInputElement>) =>
    openFlykeysFile(rootStore)(e.currentTarget)
  const onClickSaveMIDIFormat = () => saveMidiSong(rootStore)()
  const onClickSaveFlyKeysFormat = () => saveFlyKeysFile(rootStore)();
  return (
    <List>
      <ListHeader>{localized("file", "File")}</ListHeader>

      <ListItem button onClick={onClickNew}>
        <ListItemText primary={localized("new-song", "New")} />
      </ListItem>

      <FileInput onChange={onClickOpen}>
        <ListItem button>
          <ListItemText primary={localized("open-song", "Open")} />
        </ListItem>
      </FileInput>

      <FileInputFlykeysFiles onChange={onClickOpenFlykeys}>
        <ListItem button>
          <ListItemText primary={localized("open-song-flykeys", "Open Flykeys file")} />
        </ListItem>
      </FileInputFlykeysFiles>

      <ListItem button onClick={onClickSaveMIDIFormat}>
        <ListItemText primary={localized("save-song-midi", "Save as MIDI")} />
      </ListItem>

      <ListItem button onClick={onClickSaveFlyKeysFormat}>
        <ListItemText primary={localized("save-song-flykeys", "Save as .FLKS")} />
      </ListItem>

    </List>
  )
}
