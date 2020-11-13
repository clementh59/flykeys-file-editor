import { StreamSource } from "midifile-ts"
import { downloadBlob } from "../helpers/Downloader"
import Song, { songFromMidi } from "../song"
import Track, { isNoteEvent } from "../track"
import { write as writeBytes } from "./MidiFileWriter"
import { songFromFlykeys } from "../flykeys/FlykeysFileFactory"

export function readMidi(data: ArrayLike<number>): Song {
  return songFromMidi(data as StreamSource)
}

export function writeMidi(tracks: Track[], filepath: string) {
  const bytes = writeBytes(tracks)
  const blob = new Blob([bytes], { type: "application/octet-stream" })
  downloadBlob(blob, filepath ?? "newFile.mid")
}

export function readFlykeys(data: string): Song {
  return songFromFlykeys(data);
}