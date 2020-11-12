import Track, { isNoteEvent, NoteEvent } from "../track"
import { write as writeBytes } from "../midi/MidiFileWriter"
import { downloadBlob } from "../helpers/Downloader"
import Color from "color"
import { LeftHandColor, RightHandColor } from "../../main/Constants"

export function writeFlyKeys(tracks: Track[], filepath: string) {
  filepath = filepath.replace(".mid",".txt");
  const notes: NoteEvent[] = []; // La liste de notes

  // La liste des ticks, ça servira popur savoir la scale que je peux appliquer
  const ticks: number[] = [];

  tracks.forEach((track) => {
    track.events.filter(isNoteEvent).forEach((note)=>{
      notes.push(note);
      ticks.push(note.tick); // I add the starting tick
      ticks.push(note.tick+note.duration); // and the ending tick
    });
  });
  orderNotesList(notes);
  const scale = getScale(ticks);
  let fileContent = "";

  notes.forEach((note) => {
    fileContent += `${note.noteNumber} ${note.tick/scale} ${(note.tick+note.duration)/scale} ${getStringFromColor(note.color)}\n`;
  });

  let blob = new Blob([fileContent], {
    type: "text/plain;charset=utf-8"
  });

  downloadBlob(blob, filepath ?? "newFile.flks")
}

/**
 * Order the list of notes by ticks
 * @param notes
 */
function orderNotesList(notes: NoteEvent[]){
  notes.sort((a,b)=>{
    return a.tick - b.tick;
  });
}

/**
 * return the maximum scale that I can apply to the file
 * @param ticks - the list of ticks
 */
function getScale(ticks: number[]) {
  let scale = 1000000000;
  for (let i=0; i<ticks.length-1; i++) {
    const s = ticks[i+1]-ticks[i];
    if (s>0 && s<scale)
      scale = s;
  }
  return scale;
}

/**
 *
 * @param {Color} color
 * @return {string} The string corresponding to the color (e.g "MG", "MD", ...)
 */
function getStringFromColor(color:Color){
  if (color===RightHandColor)
    return "MD";
  if (color===LeftHandColor)
    return "MG";
}