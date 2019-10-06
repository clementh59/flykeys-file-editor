import { compose } from "recompose"
import { inject, observer } from "mobx-react"
import RootStore from "stores/RootStore"
import {
  PianoRollToolbarProps,
  PianoRollToolbar
} from "components/PianoRollToolbar/PianoRollToolbar"
import {
  SET_TRACK_VOLUME,
  SET_TRACK_PAN,
  SET_QUANTIZE_DENOMINATOR
} from "main/actions"

export default compose(
  inject(
    ({
      rootStore: {
        song,
        dispatch,
        pianoRollStore: s,
        services: { quantizer }
      }
    }: {
      rootStore: RootStore
    }) => {
      const track = song.selectedTrack
      const trackId = song.selectedTrackId
      return {
        track,
        quantize: s.quantize === 0 ? quantizer.denominator : s.quantize,
        mouseMode: s.mouseMode,
        autoScroll: s.autoScroll,
        onClickPencil: () => (s.mouseMode = "pencil"),
        onClickSelection: () => (s.mouseMode = "selection"),
        onClickAutoScroll: () => (s.autoScroll = !s.autoScroll),
        onSelectQuantize: e => {
          dispatch(SET_QUANTIZE_DENOMINATOR, e.denominator)
          s.quantize = e.denominator
        },
        onChangeVolume: value => dispatch(SET_TRACK_VOLUME, trackId, value),
        onChangePan: value => dispatch(SET_TRACK_PAN, trackId, value),
        onClickNavBack: () => (s.openDrawer = true),
        onClickInstrument: () => (s.openInstrumentBrowser = true)
      } as PianoRollToolbarProps
    }
  ),
  observer
)(PianoRollToolbar)
