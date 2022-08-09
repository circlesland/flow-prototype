import {createMachine, sendParent} from "xstate";
import {ProcessEvent} from "../../../process/processEvent";
import {ProcessContext} from "../../../process/processContext";
import {processActions} from "../../../process/processActions";
import {RuntimeProcess} from "../../../process/runtimeProcess";
import {prompts} from "../../../process/promptService";

export type AddNewSafeOwnerContextData = {
  newOwnerAddress: string
}

export const addNewSafeOwner = (process: RuntimeProcess<AddNewSafeOwnerContextData>) => {
  return createMachine<ProcessContext<AddNewSafeOwnerContextData>, ProcessEvent>(
    {
      id: `addNewSafeOwner`,
      initial: "addOwner",
      context: {
        processId: process.process.id,
        data: {
          newOwnerAddress: ""
        }
      },
      on: {
        "cancel": "cancelled",
        "back": {
          actions: "onBackToParent"
        }
      },
      states: {
        addOwner: {
          invoke: {
            src: "addNewSafeOwner",
            onError: {
              target: "addOwner",
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
            () => console.log("addNewSafeOwner.cancelled")
          ],
          type: "final"
        }
      }
    },
    {
      actions: processActions,
      services: {
        addNewSafeOwner: prompts.wait(process, "addNewSafeOwner", {canNavigate: true, canGoBack: true, canSkip: false})
      }
    }
  );
}