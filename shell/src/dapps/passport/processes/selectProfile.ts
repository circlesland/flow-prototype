import {createMachine, sendParent} from "xstate";
import {ProcessEvent} from "../../../process/processEvent";
import {ProcessContext} from "../../../process/processContext";
import {processActions} from "../../../process/processActions";
import {RuntimeProcess} from "../../../process/runtimeProcess";
import {prompts} from "../../../process/promptService";

export type SelectProfileContextData = {
  id: number
}
export const selectProfile = (process: RuntimeProcess<SelectProfileContextData>) => {
  return createMachine<ProcessContext<SelectProfileContextData>, ProcessEvent>(
    {
      id: `selectProfile`,
      initial: "profile",
      context: {
        processId: process.process.id,
        data: {
          id: 0
        }
      },
      on: {
        "cancel": "cancelled",
        "back": {
          actions: "onBackToParent"
        }
      },
      states: {
        profile: {
          invoke: {
            src: "promptProfile",
            onError: {
              target: "profile",
              actions: "onError"
            }
          },
          on: {
            "back": {
              actions: sendParent({
                type: "back"
              })
            },
            "submit": {
              actions: "onSubmit",
              target: "finished"
            },
            "skip": "finished"
          }
        },
        finished: {
          type: "final",
          data: context => context.data,
          entry: "submit"
        },
        cancelled: {
          entry: [
            sendParent({
              type: "cancel"
            }),
            () => console.log("selectProfile.cancelled")
          ],
          type: "final"
        }
      }
    },
    {
      actions: processActions,
      services: {
        promptProfile: prompts.profile(process, "profile", {canNavigate: true})
      }
    }
  );
}