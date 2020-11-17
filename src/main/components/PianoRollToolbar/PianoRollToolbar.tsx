import { AppBar, IconButton, TextField, Toolbar } from "@material-ui/core"
import { KeyboardTab, Menu as MenuIcon } from "@material-ui/icons"
import { makeStyles } from "@material-ui/styles"
import { useObserver } from "mobx-react-lite"
import React, { ChangeEvent, FC, useCallback, useState } from "react"
import styled from "styled-components"
import { localized } from "../../../common/localize/localizedString"
import { useStores } from "../../hooks/useStores"
import InstrumentBrowser from "../InstrumentBrowser/InstrumentBrowser"
import { GhostTrackSelector } from "./GhostTrackSelector"
import { InstrumentButton } from "./InstrumentButton"
import { PanSlider } from "./PanSlider"
import QuantizeSelector from "./QuantizeSelector/QuantizeSelector"
import { StyledToggleButton, ToolSelector } from "./ToolSelector"
import { TrackNameInput } from "./TrackNameInput"
import { VolumeSlider } from "./VolumeSlider"
import Box from "@material-ui/core/Box"
import { simplifyMidi } from "../../actions"

const useStyles = makeStyles((theme) => ({
  appBar: {
    background: "var(--background-color)",
    borderBottom: "1px solid var(--divider-color)",
  },
  title: {
    marginRight: "1rem",
  },
}))

const AutoScrollIcon = styled(KeyboardTab)`
  height: 2rem;
  font-size: 1.3rem;
`

const NavBackButton = styled(IconButton)`
  &:hover {
    background: none;
    color: var(--secondary-text-color);
  }
`

export const PianoRollToolbar: FC = () => {
  const { rootStore: stores } = useStores()

  const [scale, setScale] = useState(4);

  const { trackName, autoScroll, track, trackId, quantize } = useObserver(
    () => ({
      trackName: stores.song.selectedTrack?.displayName ?? "",
      track: stores.song.selectedTrack,
      trackId: stores.song.selectedTrackId,
      quantize:
        stores.pianoRollStore.quantize === 0
          ? stores.services.quantizer.denominator
          : stores.pianoRollStore.quantize,
      autoScroll: stores.pianoRollStore.autoScroll,
    })
  )
  const { rootViewStore, pianoRollStore: s } = stores

  const onClickAutoScroll = useCallback(() => (s.autoScroll = !s.autoScroll), [
    s,
  ])
  const onSelectQuantize = useCallback(
    (denominator: number) => {
      stores.services.quantizer.denominator = denominator
      s.quantize = denominator
    },
    [stores, s]
  )
  const onClickNavBack = useCallback(() => (rootViewStore.openDrawer = true), [
    rootViewStore,
  ])

  const classes = useStyles({})

  const onScaleChange = (text:ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    try {
      setScale(parseInt(text.target.value));
    } catch (e) {
      console.log(e);
    }
  }

  const onClickSimplifyMIDI = (scale:number) => {
    simplifyMidi(stores)(scale);
  };

  if (track === undefined) {
    return <></>
  }

  return (
    <AppBar position="static" elevation={0} className={classes.appBar}>
      <Toolbar variant="dense">
        <NavBackButton onClick={onClickNavBack}>
          <MenuIcon />
        </NavBackButton>

        <TrackNameInput />

        <InstrumentButton />
        <InstrumentBrowser />

        <VolumeSlider trackId={trackId} />
        <PanSlider trackId={trackId} />

        <ToolSelector />

        <QuantizeSelector value={quantize} onSelect={onSelectQuantize} />

        <StyledToggleButton
          onClick={onClickAutoScroll}
          selected={autoScroll}
          value="autoScroll"
          title={localized("auto-scroll", "Auto-Scroll")}
        >
          <AutoScrollIcon />
        </StyledToggleButton>

        <Box marginLeft={2}/>

        <TextField id="outlined-basic" label="Scale" variant="outlined" onChange={onScaleChange} defaultValue={scale}/>

        <Box marginLeft={2}/>

        <StyledToggleButton
          onClick={()=>onClickSimplifyMIDI(scale)}
          selected={false}
          value="autoScroll"
          title={"simplify midi"}
        >
          <AutoScrollIcon />
        </StyledToggleButton>

        <GhostTrackSelector />
      </Toolbar>
    </AppBar>
  )
}
