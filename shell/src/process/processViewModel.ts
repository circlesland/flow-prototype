import {View} from "../views/viewTypes";
import {KeyboardEvents} from "./promptConfig";
import {NavigationInfo} from "./promptService";

export class ProcessViewModel {
  views: View[] = [];
  keyboardEvents?: KeyboardEvents;
  navigation: NavigationInfo
}