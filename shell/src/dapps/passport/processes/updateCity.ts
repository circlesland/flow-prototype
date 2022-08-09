import {createMachine, sendParent} from "xstate";
import {ProcessEvent} from "../../../process/processEvent";
import {ProcessContext} from "../../../process/processContext";
import {prompts} from "../../../process/promptService";
import {processActions} from "../../../process/processActions";
import {RuntimeProcess} from "../../../process/runtimeProcess";

export type CityData = {
  city?: string
}

export const updateCity = (process:RuntimeProcess<CityData>) =>
  createMachine<ProcessContext<CityData>, ProcessEvent>(
  {
    id: `updateCity`,
    initial: "city",
    context: {
      processId: process.process.id,
      data: {}
    },
    on: {
      cancel: "cancelled",
    },
    states: {
      city: {
        invoke: {
          src: "promptCity",
          onError: {
            target: "city",
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
          () => console.log("updateCity.cancelled")
        ],
        type: "final"
      }
    }
  },
  {
    actions: processActions,
    services: {
      promptCity: prompts.city(process, "city", {canNavigate: true, canGoBack: true, canSkip: true})
    }
  }
);
