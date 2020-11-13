import { observe } from "mobx"
import { isNotNull } from "../../common/helpers/array"
import { resetSelection } from "../actions"
import MIDIOutput from "../services/MIDIOutput"
import RootStore from "./RootStore"

export const registerReactions = (rootStore: RootStore) => {
  // reset selection when tool changed
  observe(rootStore.pianoRollStore, "mouseMode", resetSelection(rootStore))
}
