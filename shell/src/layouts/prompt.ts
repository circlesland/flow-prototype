import {ProcessViewModel} from "../process/processViewModel";
import {KeyboardEvents, PromptConfig} from "../process/promptConfig";
import {NavigationInfo} from "../process/promptService";
import {ViewTypes} from "../views/viewTypes";
import {ProcessHost} from "../process/processHost";

export type ShowConfig = {
  id: string,
  title: string,
  navigation: NavigationInfo,
  keyboardEvents?: KeyboardEvents
  page: ViewTypes,
  params?: {[x:string]:any}
};

export function show(config:ShowConfig) : ProcessViewModel {
  return {
    navigation: config.navigation,
    keyboardEvents: {
      "Escape": (processId) => {
        return {
          type: "cancel",
          processId: processId
        }
      },
      ...config.keyboardEvents
    },
    views: [{
      type: "VerticalLayout",
      params: {
      },
      inner: [{
        type: "HorizontalLayout",
        params: {
          overflow: "justify-evenly"
        },
        inner: [{
          type: "Title",
          params: {
            text: config.title
          }
        }]
      }, <any> {
        id: config.id,
        type: config.page,
        params: config.params
      }]
    }]
  };
}

export function prompt(config:PromptConfig) : ProcessViewModel {
  return {
    navigation: config.navigation,
    keyboardEvents: {
      "Enter": (processId) => {
        if (ProcessHost.instance.isCancelling(processId)) {
          return;
        }
        return {
          type: "submit"
        }
      },
      "Escape": (processId) => {
        if (ProcessHost.instance.isCancelling(processId)) {
          return;
        }
        return {
          type: "cancel",
          processId: processId
        }
      },
      "Shift+Backspace": (processId) => {
        if (ProcessHost.instance.isCancelling(processId)) {
          return;
        }
        return {
          type: "back"
        }
      },
      ...config.keyboardEvents
    },
    views: [{
      type: "VerticalLayout",
      params: {
      },
      inner: [{
        type: "HorizontalLayout",
        params: {
          overflow: "justify-evenly"
        },
        inner: [{
          type: "Title",
          params: {
            text: config.title
          }
        }]
      }, <any> {
        id: config.id,
        type: config.editor,
        params: config.params
      }, {
        type: "HorizontalLayout",
        params: {
          overflow: "justify-evenly"
        },
        inner: [{
          type: "Button",
          params: {
            cssClass: "btn btn-primary",
            text: "Submit",
            event: {type: "submit"}
          }
        }]
      }]
    }]
  };
}