import {createMachine} from "xstate";
import {ProcessEvent} from "../../../process/processEvent";
import {ProcessContext} from "../../../process/processContext";
import {NameData, updateName} from "./updateName";
import {CityData, updateCity} from "./updateCity";
import {processActions} from "../../../process/processActions";
import {AvatarData, updateAvatar} from "./updateAvatar";
import {RuntimeProcess} from "../../../process/runtimeProcess";
import {selectProfile, SelectProfileContextData} from "./selectProfile";

export type UpdatePersonContextData = SelectProfileContextData & NameData & CityData & AvatarData;

export const updatePerson = (process: RuntimeProcess<UpdatePersonContextData>) => {
  const selectProfileMachine = selectProfile(<any>process);
  const updateNameMachine = updateName(<any>process);
  const updateCityMachine = updateCity(<any>process);
  const updateAvatarMachine = updateAvatar(<any>process);

  return createMachine<ProcessContext<UpdatePersonContextData>, ProcessEvent>(
    {
      id: `updatePerson`,
      initial: "selectProfile",
      context: {
        processId: process.process.id,
        data: {
          id: 0,
          firstName: ""
        }
      },
      on: {
        "cancel": {
          target: "cancelled"
        },
        "nop": "selectProfile",
        "back": {
          actions: "nop"
        }
      },
      states: {
        selectProfile: {
          invoke: {
            src: "selectProfile",
            data: (context, event) => {
              return {
                ...context,
                isReEntry: event.type == "back"
              };
            },
            onError: {
              actions: "error",
              target: "selectProfile"
            }
          },
          on: {
            "submit": {
              actions: "onSubmit",
              target: "updateName"
            }
          }
        },
        updateName: {
          invoke: {
            src: "updateName",
            data: (context, event) => {
              return {
                data: context.data,
                isReEntry: event.type == "back"
              };
            },
            onError: {
              actions: "error",
              target: "updateName"
            }
          },
          on: {
            "submit": {
              actions: "onSubmit",
              target: "updateCity"
            }
          }
        },
        updateCity: {
          invoke: {
            src: "updateCity",
            data: (context, event) => {
              return {
                data: context.data,
                isReEntry: event.type == "back"
              };
            },
            onError: {
              actions: "error",
              target: "updateCity"
            }
          },
          on: {
            "back": "updateName",
            "submit": {
              actions: "onSubmit",
              target: "updateAvatar"
            }
          }
        },
        updateAvatar: {
          invoke: {
            src: "updateAvatar",
            data: (context, event) => {
              return {
                data: context.data,
                isReEntry: event.type == "back"
              };
            },
            onError: {
              actions: "error",
              target: "updateAvatar"
            }
          },
          on: {
            "back": "updateCity",
            "submit": {
              actions: "onSubmit",
              target: "finished"
            }
          }
        },
        cancelled: {
          type: "final",
          entry: () => console.log("updatePerson.cancelled"),
          data: context => context.data
        },
        finished: {
          type: "final",
          entry: () => console.log("updatePerson.final"),
          data: context => context.data
        }
      }
    },
    {
      actions: processActions,
      services: {
        updateName: updateNameMachine,
        updateCity: updateCityMachine,
        updateAvatar: updateAvatarMachine,
        selectProfile: selectProfileMachine
      }
    }
  );
}