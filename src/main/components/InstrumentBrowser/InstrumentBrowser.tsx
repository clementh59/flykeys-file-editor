import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  FormControlLabel,
} from "@material-ui/core"
import difference from "lodash/difference"
import groupBy from "lodash/groupBy"
import map from "lodash/map"
import range from "lodash/range"
import { useObserver } from "mobx-react-lite"
import React, { FC } from "react"
import { isNotUndefined } from "../../../common/helpers/array"
import { localized } from "../../../common/localize/localizedString"
import { getGMCategory } from "../../../common/midi/GM"
import { programChangeMidiEvent } from "../../../common/midi/MidiEvent"
import { setTrackInstrument as setTrackInstrumentAction } from "../../actions"
import { useStores } from "../../hooks/useStores"
import "./InstrumentBrowser.css"

export interface InstrumentSetting {
  programNumber: number
  isRhythmTrack: boolean
}

export interface InstrumentBrowserProps {
  isOpen: boolean
  setting: InstrumentSetting
  presetCategories: PresetCategory[]
  onChange: (setting: InstrumentSetting) => void
  onClickOK: () => void
  onClickCancel: () => void
}

export interface PresetItem {
  name: string
  programNumber: number
}

export interface PresetCategory {
  name: string
  presets: PresetItem[]
}

const InstrumentBrowser: FC<InstrumentBrowserProps> = ({
  onClickCancel,
  onClickOK,
  isOpen,
  presetCategories,
  onChange,
  setting: { programNumber, isRhythmTrack },
}) => {
  const selectedCategoryId = Math.floor(programNumber / 8)

  const onChangeCategory = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({
      programNumber: e.target.selectedIndex * 8, // カテゴリの最初の楽器を選ぶ
      isRhythmTrack,
    })
  }

  const onChangeInstrument = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({
      programNumber: parseInt(e.target.value),
      isRhythmTrack,
    })
  }

  const onChangeRhythmTrack = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ programNumber, isRhythmTrack: e.target.checked })
  }

  const instruments =
    presetCategories.length > selectedCategoryId
      ? presetCategories[selectedCategoryId].presets
      : []

  const categoryOptions = presetCategories.map(
    (preset: PresetCategory, i: number) => {
      return (
        <option key={i} value={i}>
          {preset.name}
        </option>
      )
    }
  )

  const instrumentOptions = instruments.map((p: PresetItem, i: number) => {
    return (
      <option key={i} value={p.programNumber}>
        {p.name}
      </option>
    )
  })

  return (
    <Dialog open={isOpen} onClose={onClickCancel}>
      <div className="InstrumentBrowser">
        <div className="container">
          <div className={`finder ${isRhythmTrack ? "disabled" : ""}`}>
            <div className="left">
              <label>{localized("categories", "Categories")}</label>
              <select
                size={12}
                onChange={onChangeCategory}
                value={selectedCategoryId}
              >
                {categoryOptions}
              </select>
            </div>
            <div className="right">
              <label>{localized("instruments", "Instruments")}</label>
              <select
                size={12}
                onChange={onChangeInstrument}
                value={programNumber}
              >
                {instrumentOptions}
              </select>
            </div>
          </div>
          <div className="footer">
            <FormControlLabel
              control={
                <Checkbox
                  checked={isRhythmTrack}
                  onChange={onChangeRhythmTrack}
                  color="primary"
                />
              }
              label={localized("rhythm-track", "Rhythm Track")}
            />
          </div>
        </div>
      </div>
      <DialogActions>
        <Button onClick={onClickCancel}>{localized("cancel", "Cancel")}</Button>
        <Button color="primary" onClick={onClickOK}>
          {localized("ok", "OK")}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

const InstrumentBrowserWrapper: FC = () => {
  const { rootStore: stores } = useStores()
  const {
    track,
    trackId,
    presetNames,
    s,
    player,
    song,
    instrumentBrowserSetting,
    openInstrumentBrowser,
  } = useObserver(() => ({
    track: stores.song.selectedTrack,
    trackId: stores.song.selectedTrackId,
    presetNames: stores.pianoRollStore.presetNames,
    s: stores.pianoRollStore,
    player: stores.services.player,
    song: stores.song,
    instrumentBrowserSetting: stores.pianoRollStore.instrumentBrowserSetting,
    openInstrumentBrowser: stores.pianoRollStore.openInstrumentBrowser,
  }))

  if (track === undefined) {
    throw new Error("selectedTrack is undefined")
  }

  const close = () => (s.openInstrumentBrowser = false)
  const setTrackInstrument = (programNumber: number) =>
    setTrackInstrumentAction(stores)(trackId, programNumber)

  const presets: PresetItem[] = Object.keys(presetNames[0]).map((key) => ({
    programNumber: parseInt(key),
    name: presetNames[0][parseInt(key)],
  }))

  const presetCategories = map(
    groupBy(presets, (p) => getGMCategory(p.programNumber)),
    (presets, name) => ({ name, presets })
  )

  const onChange = (setting: InstrumentSetting) => {
    const channel = track.channel
    if (channel === undefined) {
      return
    }
    player.sendEvent(programChangeMidiEvent(0, channel, setting.programNumber))
    player.playNote({
      duration: 240,
      noteNumber: 64,
      velocity: 100,
      channel,
    })
    s.instrumentBrowserSetting = setting
  }

  return (
    <InstrumentBrowser
      isOpen={openInstrumentBrowser}
      setting={instrumentBrowserSetting}
      onChange={onChange}
      onClickCancel={() => {
        close()
      }}
      onClickOK={() => {
        if (instrumentBrowserSetting.isRhythmTrack) {
          track.channel = 9
          setTrackInstrument(0)
        } else {
          if (track.isRhythmTrack) {
            // 適当なチャンネルに変える
            const channels = range(16)
            const usedChannels = song.tracks
              .filter((t) => t !== track)
              .map((t) => t.channel)
            const availableChannel =
              Math.min(
                ...difference(channels, usedChannels).filter(isNotUndefined)
              ) || 0
            track.channel = availableChannel
          }
          setTrackInstrument(instrumentBrowserSetting.programNumber)
        }

        close()
      }}
      presetCategories={presetCategories}
    />
  )
}

export default InstrumentBrowserWrapper
