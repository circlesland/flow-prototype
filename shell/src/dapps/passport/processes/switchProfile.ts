import {createMachine} from "xstate";
import {ProcessEvent} from "../../../process/processEvent";
import {ProcessContext} from "../../../process/processContext";
import {processActions} from "../../../process/processActions";
import {RuntimeProcess} from "../../../process/runtimeProcess";
import {prompts} from "../../../process/promptService";

export type SwitchProfileContextData = {};

export const switchProfile = (process: RuntimeProcess<SwitchProfileContextData>) => {
  return createMachine<ProcessContext<SwitchProfileContextData>, ProcessEvent>(
    {
      id: `switchProfile`,
      initial: "profileList",
      context: {
        processId: process.process.id,
        data: {}
      },
      on: {
        cancel: "cancelled",
        "nop": "profileList",
        "back": {
          actions: "nop"
        }
      },
      states: {
        profileList: {
          invoke: {
            src: "promptProfile",
            data: (context, event) => {
              return {
                ...context,
                isReEntry: event.type == "back"
              };
            },
            onError: {
              actions: "error",
              target: "profileList"
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
          entry: () => console.log("switchProfile.final"),
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
        promptProfile: prompts.profile(process, "profile", {canNavigate: false}),
      }
    }
  );
}