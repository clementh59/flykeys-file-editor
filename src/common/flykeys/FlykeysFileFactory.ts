import Track, { isNoteEvent, NoteEvent } from "../track"
import { downloadBlob } from "../helpers/Downloader"
import Color from "color"
import { LeftHandColor, RightHandColor } from "../../main/Constants"
import Song, { emptySong } from "../song"


/*************      READ     *****************/

export function songFromFlykeys(data: string) {
  const song = new Song();
  const track = new Track();

  const lines = data.split('\n');

  if (lines.length==0) {
    alert("Le fichier ne contient aucune information!");
    return emptySong();
  }

  // @ts-ignore
  const [tempoStr, scaleStr] = lines.shift().split(';');

  const tempo = parseInt(tempoStr);
  const scale = parseInt(scaleStr);

  if (!tempo || !scale) {
    alert("Le fichier ne contient pas le bon header!");
    return emptySong();
  }

  lines.forEach((line)=>{
    const [keyStr, tickOnStr, tickOffStr, color] = line.split(' ');

    const key = parseInt(keyStr);
    const tickOn = parseInt(tickOnStr);
    const tickOff = parseInt(tickOffStr);

    if (key && tickOn && tickOff && color) {
      track.addEvent({
        type: "channel",
        subtype: "note",
        duration: (tickOff)*scale,
        tick: tickOn*scale,
        velocity: 100,
        noteNumber: key,
        color:getColorFromString(color),
        hasError: false
      });
    }
  });

  song.timebase = tempo;
  song.addTrack(new Track()); // Comme ça, à l'index 0 j'ai une track inutile
  song.addTrack(track); // Et ma vraie track est à l'index 1 (Le mec travaille comme ça à voir)
  song.selectedTrackId = 1;
  return song;
}

/*************      WRITE     *****************/

export function writeFlyKeys(tracks: Track[], song: Song, oneTickToMs: number) {
  const filepath = song.filepath.replace(".mid",".txt");
  const notes: NoteEvent[] = []; // La liste de notes

  // La liste des ticks, ça servira pour savoir la scale que je peux appliquer
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

  const speed = Math.round((oneTickToMs*scale + Number.EPSILON) * 100) / 100

  console.log({
    scale : scale,
    oneTickToMs : oneTickToMs,
    speed : speed
  });

  let fileContent = `${song.timebase};${scale};${speed}\n`;

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
    if (s>0 && s<scale) {
      scale = s;
    }
  }
  return scale;
}

/**
 *
 * @param {Color} color
 * @return {string} The string corresponding to the color (e.g "MG", "MD", ...)
 */
function getStringFromColor(color:Color){
  if (color.toString()===RightHandColor.toString())
    return "MD";
  if (color.toString()===LeftHandColor.toString())
    return "MG";

  return "MD";
}

/**
 *
 * @param {string} color - The string corresponding to the color (e.g "MG", "MD", ...)
 * @return {Color}
 */
function getColorFromString(color:string){
  if (color==="MD")
    return RightHandColor;
  if (color==="MG")
    return LeftHandColor;

  return RightHandColor;
}