import {createMachine} from "xstate";
import {ProcessEvent} from "../../../process/processEvent";
import {ProcessContext} from "../../../process/processContext";
import {processActions} from "../../../process/processActions";
import {RuntimeProcess} from "../../../process/runtimeProcess";
import {prompts} from "../../../process/promptService";

export type LauncherContextData = {};

export const launcher = (process: RuntimeProcess<LauncherContextData>) => {
  return createMachine<ProcessContext<LauncherContextData>, ProcessEvent>(
    {
      id: `launcher`,
      initial: "appList",
      context: {
        processId: process.process.id,
        data: {}
      },
      on: {
        cancel: "cancelled",
        "nop": "appList",
        "back": {
          actions: "nop"
        }
      },
      states: {
        appList: {
          invoke: {
            src: "promptApp",
            data: (context, event) => {
              return {
                ...context,
                isReEntry: event.type == "back"
              };
            },
            onError: {
              actions: "error",
              target: "appList"
            }
          },
          on: {
            "cancel": "cancelled",
            "submit": {
              actions: "onSubmit",
              target: "finished"
            }
          }
        },
        finished: {
          type: "final",
          entry: () => console.log("launcher.final"),
          data: context => context.data
        },
        cancelled: {
          type: "final"
        }
      }
    },
    {
      actions: processActions,
      services: {
        promptApp: prompts.app(process, "app", {canNavigate: false, canGoBack: false, canSkip: false}),
      }
    }
  );
}