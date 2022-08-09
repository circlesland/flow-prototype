import {View} from "../views/viewTypes";
import {ProcessEvent} from "./processEvent";
import {PromptCallbackServiceFactory, PromptResult} from "./processServices";
import {ProcessViewModel} from "./processViewModel";
import {prompt, show} from "../layouts/prompt";
import {RuntimeProcess} from "./runtimeProcess";
import {ViewEvent} from "../views/viewEventTypes";

function findAllValuesById(editorViewModel: ProcessViewModel) {
  const result: { [sectionId: string]: { [prop: string]: any } } = {};

  const stack: View[] = [...editorViewModel.views];
  while (stack.length > 0) {
    const currentView = stack.pop();

    if (currentView.type == "VerticalLayout"
      || currentView.type == "HorizontalLayout") {
      currentView.inner.forEach(o => stack.push(o));
    }

    if (currentView.id) {
      result[currentView.id] = currentView.params;
    }
  }
  return result;
}

export type NavigationInfo = {
  canNavigate: boolean
  canGoBack?: boolean
  canSkip?: boolean
};

export const prompts = {
  app: (process:RuntimeProcess<any>, id: string, navigation:NavigationInfo) => promptCallbackFactory(process, show({
    id: id,
    page: "AppList",
    title: "Run a process",
    params:{
      apps: []
    },
    navigation: navigation
  })),
  firstName: (process:RuntimeProcess<any>, id: string, navigation:NavigationInfo) => promptCallbackFactory(process, prompt({
    id: id,
    editor: "SingleLineTextInput",
    title: "Please enter your first name",
    params:{
      value: "",
      autoFocus: true
    },
    navigation: navigation
  })),
  lastName: (process:RuntimeProcess<any>, id: string, navigation:NavigationInfo) => promptCallbackFactory(process, prompt({
    id: id,
    editor: "SingleLineTextInput",
    title: "Please enter your last name",
    params:{
      autoFocus: true
    },
    navigation: navigation
  })),
  city: (process:RuntimeProcess<any>, id: string, navigation:NavigationInfo) => promptCallbackFactory(process, prompt({
    id: id,
    editor: "SingleLineTextInput",
    title: "Please enter your city",
    params:{
      autoFocus: true
    },
    navigation: navigation
  })),
  avatar: (process:RuntimeProcess<any>, id: string, navigation:NavigationInfo) => promptCallbackFactory(process, prompt({
    id: id,
    editor: "SingleLineTextInput",
    title: "Please enter your avatar url ;)",
    params:{
      autoFocus: true
    },
    navigation: navigation
  })),
  profile: (process:RuntimeProcess<any>, id: string, navigation:NavigationInfo) => promptCallbackFactory(process, prompt({
    id: id,
    editor: "SingleLineTextInput",
    title: "Please select a profile:",
    params:{
      autoFocus: true
    },
    navigation: navigation
  })),
  safe: (process:RuntimeProcess<any>, id: string, navigation:NavigationInfo) => promptCallbackFactory(process, prompt({
    id: id,
    editor: "SingleLineTextInput",
    title: "Please select a safe:",
    params:{
      autoFocus: true
    },
    navigation: navigation
  })),
  wait: (process:RuntimeProcess<any>, id: string, navigation:NavigationInfo) => promptCallbackFactory(process, prompt({
    id: id,
    editor: "Title",
    title: "Please select a safe:",
    params:{
      text: "Please wait .."
    },
    navigation: navigation
  })),
  keyphrase: (process:RuntimeProcess<any>, id: string, navigation:NavigationInfo) => promptCallbackFactory(process, prompt({
    id: id,
    editor: "SingleLineTextInput",
    title: "Please enter your keyphrase:",
    params:{
    },
    navigation: navigation
  }))
};

export const promptPromiseFactory = function prompt(runtimeProcess:RuntimeProcess<any>, viewModel: ProcessViewModel)
  : (context: { data: any, processId: string }, event: { type: string }) => Promise<PromptResult> {
  return (context) => {
    const editorViewModel: ProcessViewModel = JSON.parse(JSON.stringify(viewModel));

    if (context?.data) {
      const result = findAllValuesById(editorViewModel);
      Object.keys(result).forEach(id => result[id].value = context.data[id]);
    }

    runtimeProcess.processWindow.setViewModel({
      navigation: editorViewModel.navigation,
      views: editorViewModel.views,
      keyboardEvents: viewModel.keyboardEvents
    });

    return new Promise((resolve) => {
      runtimeProcess.processWindow.onEvent((event) => {
        const result = findAllValuesById(editorViewModel);
        switch (event.type) {
          case "continue":
            runtimeProcess.processWindow.continue();
            break;
          case "back":
          case "skip":
            resolve({
              processId: context.processId,
              type: event.type
            });
            break;
          case "cancel":
            if (runtimeProcess.processWindow.cancelRequested || !runtimeProcess.processWindow.isDirty) {
              resolve({
                processId: context.processId,
                type: event.type
              });
            } else {
              runtimeProcess.processWindow.requestCancel();
            }
            break;
          case "submit":
            const data = Object.keys(result).map(key => {
                return {
                  key: key,
                  value: result[key].value
                }
              })
              .reduce((p,c) => {
                p[c.key] = c.value;
                return p;
              }, <{[x:string]:any}>{});

            resolve(<ProcessEvent & { data: any }>{
              processId: context.processId,
              type: event.type,
              data: data
            });
            break;
          case "nop": break;
          default:
            throw new Error(`Unknown ViewEventType: ${JSON.stringify(event)}`);
        }
      })
    });
  }
}

export const promptCallbackFactory: PromptCallbackServiceFactory<any> = (runtimeProcess:RuntimeProcess<any>, viewModel: ProcessViewModel) => {
  return (context, event) => {
    return async callback => {
      try {
        const promptResult = await promptPromiseFactory(runtimeProcess, viewModel)(context, event);
        callback(promptResult);
      } catch (e) {
        callback(<ProcessEvent>{
          type: "error",
          processId: context.processId,
          error: e
        })
      }
    }
  };
}