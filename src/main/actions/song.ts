import { toJS } from "mobx"
import {
  readFlykeys,
  readMidi,
  writeMidi
} from "../../common/midi/SongFile"
import Song, { emptySong } from "../../common/song"
import { emptyTrack, isNoteEvent, NoteEvent } from "../../common/track"
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
  let oneTickToMs = rootStore.services.player.tickToMillisec(1); // If no tempo is provided in the MIDI events, the default value will be taken
  const oneTickToMsList = rootStore.services.player.readAllThePossibleTickToMs(rootStore.song);
  if (oneTickToMsList.length > 1) { // if multiple tempo were provided in the MIDI events
    alert('Il y a plusieurs timebase dans le fichier! La speed dans le fichier flykeys peut ne pas être la bonne.');
  }  else if (oneTickToMsList.length === 1) { // if a single tempo event were provided in the MIDI events
    oneTickToMs = oneTickToMsList[0];
    console.log("Il y a un timebase event, je le prend en compte");
  } else {
    console.log("Il n'y a pas de timebase event");
  }

  if (!checkIfTheSongIsCompatibleWithFlykeys(song))
    return;

  writeFlyKeys(toJS(song.tracks, { recurseEverything: true }), song, oneTickToMs);
}

/**
 * returns true if ok - false otherwise
 * Pops an alert with the reason why it failed
 * @param song
 */
const checkIfTheSongIsCompatibleWithFlykeys = (song: Song) => {
  if (checkIfThereAreSuperpositionIssues(song)) {
    alert('Il y a des problèmes de superposition!');
    return false;
  }

  return true;
}

/**
 * Check if there are superposition problem (at a certain tick, there are two notes on a key)
 * return true if there is at least one - false otherwise
 */
const checkIfThereAreSuperpositionIssues = (song: Song) => {
  const notes: Set<number>[] = []; // La liste de notes

  // pour dire d'être large
  for (let i = 0; i < 300; i++) {
    notes.push(new Set());
  }

  let error = false;

  song.tracks.forEach((track) => {
    track.events.filter(isNoteEvent).forEach((note)=>{
      for (let i = note.tick; i < note.tick + note.duration; i++) {
        if (!notes[note.noteNumber].has(i)) {
          notes[note.noteNumber].add(i);
          note.hasError = false;
        } else {
          console.log('Superposition with key : ' + note.noteNumber + ', tick : ' + note.tick);
          error = true;
          note.hasError = true;
          return;
        }
      }
    });
  });

  return error;
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