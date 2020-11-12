import { action, computed, observable } from "mobx"
import JsonStore from "../helpers/electron-json-store"
import { serializable } from "serializr"
import Color from "color"
import { RightHandColor } from "../Constants"

export default class SettingsStore {
  @observable private _soundFontPath: string | null
  storage = new JsonStore()
  _defaultNoteColor: Color = RightHandColor

  constructor() {
    this._soundFontPath = this.storage.get("soundFontPath")
    this._defaultNoteColor = RightHandColor;
    console.log(`Setting was restored from ${this.storage.path}`)
  }

  set soundFontPath(path: string | null) {
    this._soundFontPath = path
    this.storage.set("soundFontPath", path)
  }

  @computed get soundFontPath() {
    return this._soundFontPath
  }

  set defaultNoteColor(color: Color) {
    console.log("the new color is "+color);
    this._defaultNoteColor = color;
  }

  @computed get defaultNoteColor() {
    return this._defaultNoteColor;
  }

  @action clear() {
    this.storage.clear()
    this._soundFontPath = null
  }
}
