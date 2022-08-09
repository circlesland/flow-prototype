import {ViewTypes} from "../views/viewTypes";
import {ViewEvent} from "../views/viewEventTypes";
import {NavigationInfo} from "./promptService";

export type PromptConfig = {
  id: string,
  title: string,
  navigation: NavigationInfo,
  keyboardEvents?: KeyboardEvents
  editor: ViewTypes,
  params?: {[x:string]:any}
};

export type KeyboardEvents = {
  [key:string]: (processId:string) => ViewEvent
};