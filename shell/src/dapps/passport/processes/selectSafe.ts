import {createMachine, sendParent} from "xstate";
import {ProcessEvent} from "../../../process/processEvent";
import {ProcessContext} from "../../../process/processContext";
import {processActions} from "../../../process/processActions";
import {RuntimeProcess} from "../../../process/runtimeProcess";
import {prompts} from "../../../process/promptService";

export type SelectSafeContextData = {
  safeAddress: string
}
export const selectSafe = (process: RuntimeProcess<SelectSafeContextData>) => {
  return createMachine<ProcessContext<SelectSafeContextData>, ProcessEvent>(
    {
      id: `selectSafe`,
      initial: "safe",
      context: {
        processId: process.process.id,
        data: {
          safeAddress: ""
        }
      },
      on: {
        "cancel": "cancelled",
        "back": {
          actions: "onBackToParent"
        }
      },
      states: {
        safe: {
          invoke: {
            src: "promptSafe",
            onError: {
              target: "safe",
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
            () => console.log("selectSafe.cancelled")
          ],
          type: "final"
        }
      }
    },
    {
      actions: processActions,
      services: {
        promptSafe: prompts.safe(process, "safe", {canNavigate: true, canGoBack: true, canSkip: false})
      }
    }
  );
}