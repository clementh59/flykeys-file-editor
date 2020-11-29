import { toJS } from "mobx"
import {
  readFlykeys,
  readMidi,
  writeMidi
} from "../../common/midi/SongFile"
import Song, { emptySong } from "../../common/song"
import { emptyTrack, isNoteEvent } from "../../common/track"
import RootStore from "../stores/RootStore"
import Color from "color"
import { writeFlyKeys } from "../../common/flykeys/FlykeysFileFactory"

const readImportMidiFile = (
  input: HTMLInputElement,
  callback: (song: Song | null) => void
) => {
  if (input.files === null || input.files.length === 0) {
    return
  }

  const file = input.files[0]
  const reader = new FileReader()

  reader.onload = (e) => {
    if (e.target == null) {
      callback(null)
      return
    }
    const buf = e.target.result as ArrayBuffer
    const song = readMidi(new Uint8Array(buf))
    callback(song)
  }

  reader.readAsArrayBuffer(file)
}

const readImportFlykeysFile = (
  input: HTMLInputElement,
  callback: (song: Song | null) => void
) => {
  if (input.files === null || input.files.length === 0) {
    return
  }

  const file = input.files[0]
  const reader = new FileReader()

  reader.onload = (e) => {
    if (e.target == null) {
      callback(null)
      return
    }
    const buf = e.target.result as string
    const song = readFlykeys(buf)
    callback(song)
  }

  reader.readAsText(file)
}

export const setSong = (rootStore: RootStore, song: Song) => {
  rootStore.song = song
  rootStore.services.player.reset()
  rootStore.trackMute.reset()
  rootStore.services.player.timebase = song.timebase
  rootStore.services.player.position = 0
  rootStore.services.player.stop()
  rootStore.services.quantizer.ticksPerBeat = song.timebase
  rootStore.pianoRollStore.scrollLeft = 0
  rootStore.pianoRollStore.ghostTracks = {}
  rootStore.historyStore.clear()
}

export const createSong = (rootStore: RootStore) => () => {
  const store = rootStore

  setSong(store, emptySong())
}

export const saveMidiSong = (rootStore: RootStore) => () => {
  const { song } = rootStore

  writeMidi(toJS(song.tracks, { recurseEverything: true }), song.filepath)
}

export const openMidiSong = (rootStore: RootStore) => (input: HTMLInputElement) => {
  const store = rootStore

  readImportMidiFile(input, (song) => {
    if (song === null) {
      return
    }
    setSong(store, song)
  })
}

export const openFlykeysFile = (rootStore: RootStore) => (input: HTMLInputElement) => {
  const store = rootStore

  readImportFlykeysFile(input, (song) => {
    if (song === null) {
      return
    }
    setSong(store, song)
  })
}

export const saveFlyKeysFile = (rootStore: RootStore) => () => {
  const {song} = rootStore;
  const oneTickToMs = rootStore.services.player.tickToMillisec(1);
  writeFlyKeys(toJS(song.tracks, { recurseEverything: true }), song, oneTickToMs)
}

export const addTrack = (rootStore: RootStore) => () => {
  const store = rootStore

  store.pushHistory()
  store.song.addTrack(emptyTrack(store.song.tracks.length - 1))
}

export const removeTrack = (rootStore: RootStore) => (trackId: number) => {
  const store = rootStore

  if (store.song.tracks.filter((t) => !t.isConductorTrack).length <= 1) {
    // conductor track を除き、最後のトラックの場合
    // トラックがなくなるとエラーが出るので削除できなくする
    return
  }
  store.pushHistory()
  store.song.removeTrack(trackId)
}

export const changeTrackColor = (rootStore: RootStore) => (trackId: number, color: Color) => {
  const store = rootStore

  store.pushHistory()
  store.song.updateTrackColor(trackId,color);
}

export const selectTrack = (rootStore: RootStore) => (trackId: number) => {
  const { song } = rootStore

  song.selectTrack(trackId)
}

/**
 * Rempli les trous du midi pour un affichage plus propore pour les leds
 * @param scale : by how many I divide the timebase
 */
export const simplifyMidi = (rootStore: RootStore) => (scale:number) => {
  const { song } = rootStore;
  //note: Changer le minimumTick ici pour influer sur
  const minimumTick = song.timebase/scale;
  console.log("I simplify with the scale : " + minimumTick);
  song.tracks.forEach((track)=>{
    track.events.filter(isNoteEvent).forEach((note)=>{
      const tickRemainder = note.tick%minimumTick;
      const durationRemainder = note.duration%minimumTick;
      if (tickRemainder!=0){
        if (tickRemainder>minimumTick/2)
          note.tick += minimumTick-tickRemainder;
        else
          note.tick -= tickRemainder;
      }
      if (durationRemainder!=0){
        if (durationRemainder>minimumTick/2)
          note.duration += minimumTick-durationRemainder;
        else
          note.duration -= durationRemainder;
      }
      if (note.duration==0)
        note.duration = minimumTick;
    });
  });
}