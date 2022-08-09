import {assign, createMachine, sendParent} from "xstate";
import {ProcessEvent} from "../../../process/processEvent";
import {ProcessContext} from "../../../process/processContext";
import {prompts} from "../../../process/promptService";
import {processActions} from "../../../process/processActions";
import {RuntimeProcess} from "../../../process/runtimeProcess";

export type NameData = {
  firstName: string
  lastName?: string
}

export const updateName = (process:RuntimeProcess<NameData>) =>
  createMachine<ProcessContext<NameData>, ProcessEvent>(
  {
    id: `updateName`,
    initial: "firstName",
    context: {
      processId: process.process.id,
      error: undefined,
      data: {
        firstName: undefined,
        lastName: undefined
      }
    },
    on: {
      "cancel": {
        target: "cancelled"
      },
      "back": {
        actions: "onBackToParent"
      }
    },
    states: {
      firstName: {
        always:[{
          cond: context => context.isReEntry,
          target: "lastName"
        }],
        invoke: {
          src: "promptFirstName",
          onError: {
            target: "firstName",
            actions: "onError"
          }
        },
        on: {
          "submit": {
            actions: "onSubmit",
            target: "lastName"
          }
        }
      },
      lastName: {
        entry: assign({
          isReEntry: () => false
        }),
        invoke: {
          src: "promptLastName",
          onError: {
            target: "lastName",
            actions: "onError"
          }
        },
        on: {
          "back": "firstName",
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
        type: "final",
        entry: [
          () => console.log(`updateName(id:${process.process.id}).cancelled`),
          sendParent({
            type: "cancel"
          })
        ],
      }
    }
  },
  {
    actions: {
      ...processActions
    },
    services: {
      promptFirstName: prompts.firstName(process, "firstName", {canNavigate: true, canGoBack: true, canSkip: false}),
      promptLastName: prompts.lastName(process, "lastName", {canNavigate: true, canGoBack: true, canSkip: true})
    }
  }
);
