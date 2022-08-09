import {createMachine, sendParent} from "xstate";
import {ProcessEvent} from "../../../process/processEvent";
import {ProcessContext} from "../../../process/processContext";
import {prompts} from "../../../process/promptService";
import {processActions} from "../../../process/processActions";
import {RuntimeProcess} from "../../../process/runtimeProcess";

export type AvatarData = {
  avatarUrl?: string
}

export const updateAvatar = (process: RuntimeProcess<AvatarData>) =>
  createMachine<ProcessContext<AvatarData>, ProcessEvent>(
    {
      id: `updateAvatar`,
      initial: "avatar",
      context: {
        processId: process.process.id,
        data: {}
      },
      on: {
        "cancel": "cancelled",
        "back": {
          actions: "onBackToParent"
        }
      },
      states: {
        avatar: {
          invoke: {
            src: "promptAvatar",
            onError: {
              target: "avatar",
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
            () => console.log("updateAvatar.cancelled")
          ],
          type: "final"
        }
      }
    },
    {
      actions: processActions,
      services: {
        promptAvatar: prompts.avatar(process, "avatarUrl", {canNavigate: true, canGoBack: true, canSkip: true})
      }
    }
  );