import {createMachine, sendParent} from "xstate";
import {ProcessEvent} from "../../../process/processEvent";
import {ProcessContext} from "../../../process/processContext";
import {processActions} from "../../../process/processActions";
import {RuntimeProcess} from "../../../process/runtimeProcess";
import {prompts} from "../../../process/promptService";

export type ConnectEoaContextData = {
  eoaAddress: string
  eoaKey: string
}
export const connectEoa = (process: RuntimeProcess<ConnectEoaContextData>) => {
  return createMachine<ProcessContext<ConnectEoaContextData>, ProcessEvent>(
    {
      id: `connectEoa`,
      initial: "keyphrase",
      context: {
        processId: process.process.id,
        data: {
          eoaKey: "",
          eoaAddress: ""
        }
      },
      on: {
        "cancel": "cancelled",
        "back": {
          actions: "onBackToParent"
        }
      },
      states: {
        keyphrase: {
          invoke: {
            src: "promptKeyphrase",
            onError: {
              target: "keyphrase",
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
            () => console.log("connectEoa.cancelled")
          ],
          type: "final"
        }
      }
    },
    {
      actions: processActions,
      services: {
        promptKeyphrase: prompts.keyphrase(process, "keyphrase", {canNavigate: true, canGoBack: true, canSkip: false})
      }
    }
  );
}