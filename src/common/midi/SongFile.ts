import { StreamSource } from "midifile-ts"
import { downloadBlob } from "../helpers/Downloader"
import Song, { songFromMidi } from "../song"
import Track, { isNoteEvent } from "../track"
import { write as writeBytes } from "./MidiFileWriter"

export function readMidi(data: ArrayLike<number>): Song {
  return songFromMidi(data as StreamSource)
}

export function writeMidi(tracks: Track[], filepath: string) {
  const bytes = writeBytes(tracks)
  const blob = new Blob([bytes], { type: "application/octet-stream" })
  downloadBlob(blob, filepath ?? "newFile.mid")
}