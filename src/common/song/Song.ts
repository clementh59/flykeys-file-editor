import pullAt from "lodash/pullAt"
import { action, autorun, computed, observable, transaction } from "mobx"
import { list, object, serializable } from "serializr"
import { RightHandColor, TIME_BASE } from "../../main/Constants"
import { isNotUndefined } from "../helpers/array"
import { Measure } from "../measure/Measure"
import { getMeasuresFromConductorTrack } from "../measure/MeasureList"
import Track, { isNoteEvent } from "../track"
import Color from "color"

const END_MARGIN = 480 * 30

export default class Song {
  @serializable(list(object(Track)))
  @observable.shallow
  tracks: Track[] = []

  @serializable
  @observable
  selectedTrackId: number = 0

  @serializable
  @observable
  filepath: string = ""

  @serializable
  @observable
  timebase: number = TIME_BASE

  name: string

  private _endOfSong: number = 0

  private _updateEndOfSong() {
    const eos = Math.max(
      ...this.tracks.map((t) => t.endOfTrack).filter(isNotUndefined)
    )
    this._endOfSong = (eos ?? 0) + END_MARGIN
  }

  // デシリアライズ時に呼ぶこと
  onDeserialized() {
    this._updateEndOfSong()
  }

  disposer: (() => void) | null = null

  @action addTrack(t: Track) {
    // 最初のトラックは Conductor Track なので channel を設定しない
    if (t.channel === undefined && this.tracks.length > 0) {
      t.channel = t.channel || this.tracks.length - 1
    }
    this.tracks.push(t)
    this._updateEndOfSong()

    if (this.disposer) {
      this.disposer()
    }
    this.disposer = autorun(() => {
      this._updateEndOfSong()
    })
  }

  @action removeTrack(id: number) {
    transaction(() => {
      pullAt(this.tracks, id)
      this.selectTrack(Math.min(id, this.tracks.length - 1))
      this._updateEndOfSong()
    })
  }

  @action updateTrackColor(id: number, color: Color) {
    transaction(() => {
      this.tracks[id].events.filter(isNoteEvent).forEach((note)=>{
        note.color = color;
      });
    })
  }

  @action selectTrack(id: number) {
    if (id === this.selectedTrackId) {
      return
    }
    this.selectedTrackId = id
  }

  @computed get conductorTrack(): Track | undefined {
    return this.tracks.find((t) => t.isConductorTrack)
  }

  @computed get selectedTrack(): Track | undefined {
    return this.tracks[this.selectedTrackId]
  }

  getTrack(id: number): Track {
    return this.tracks[id]
  }

  get measures(): Measure[] {
    return this.getMeasures(480) // FIXME
  }

  private getMeasures(timebase: number): Measure[] {
    const { conductorTrack } = this
    if (conductorTrack === undefined) {
      return []
    }
    return getMeasuresFromConductorTrack(conductorTrack, timebase)
  }

  get endOfSong(): number {
    return this._endOfSong
  }

  trackIdOfChannel(channel: number): number | undefined {
    const tracks = this.tracks
    const track = tracks.find((t) => t.channel === channel)
    if (track) {
      return tracks.indexOf(track)
    }
    return undefined
  }
}
