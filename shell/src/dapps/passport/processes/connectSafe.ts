import {createMachine} from "xstate";
import {ProcessEvent} from "../../../process/processEvent";
import {ProcessContext} from "../../../process/processContext";
import {processActions} from "../../../process/processActions";
import {RuntimeProcess} from "../../../process/runtimeProcess";
import {connectEoa, ConnectEoaContextData} from "./connectEoa";
import {selectSafe, SelectSafeContextData} from "./selectSafe";
import {addNewSafeOwner, AddNewSafeOwnerContextData} from "./addNewSafeOwner";
import {selectProfile, SelectProfileContextData} from "./selectProfile";

export type ConnectSafeContextData =
  SelectProfileContextData
  & ConnectEoaContextData
  & SelectSafeContextData
  & AddNewSafeOwnerContextData;

export const connectSafe = (process: RuntimeProcess<ConnectSafeContextData>) => {
  const selectProfileMachine = selectProfile(<any>process);
  const connectEoaMachine = connectEoa(<any>process);
  const selectSafeMachine = selectSafe(<any>process);
  const addNewSafeOwnerMachine = addNewSafeOwner(<any>process);

  return createMachine<ProcessContext<ConnectSafeContextData>, ProcessEvent>(
    {
      id: `connectSafe`,
      initial: "selectProfile",
      context: {
        processId: process.process.id,
        data: {
          id: 0,
          eoaAddress: "",
          eoaKey: "",
          safeAddress: "",
          newOwnerAddress: ""
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
              target: "connectEoa"
            }
          }
        },
        connectEoa: {
          invoke: {
            src: "connectEoa",
            data: (context, event) => {
              return {
                ...context,
                isReEntry: event.type == "back"
              };
            },
            onError: {
              actions: "error",
              target: "connectEoa"
            }
          },
          on: {
            "submit": {
              actions: "onSubmit",
              target: "selectSafe"
            }
          }
        },
        selectSafe: {
          invoke: {
            src: "selectSafe",
            data: (context, event) => {
              return {
                ...context,
                isReEntry: event.type == "back"
              };
            },
            onError: {
              actions: "error",
              target: "selectSafe"
            }
          },
          on: {
            "back": "connectEoa",
            "submit": {
              actions: "onSubmit",
              target: "addNewSafeOwner"
            }
          }
        },
        addNewSafeOwner: {
          invoke: {
            src: "addNewSafeOwner",
            data: (context, event) => {
              return {
                ...context,
                isReEntry: event.type == "back"
              };
            },
            onError: {
              actions: "error",
              target: "addNewSafeOwner"
            }
          },
          on: {
            "back": "selectSafe",
            "submit": {
              actions: "onSubmit",
              target: "finished"
            }
          }
        },
        cancelled: {
          type: "final",
          entry: () => console.log("connectSafe.cancelled"),
          data: context => context.data
        },
        finished: {
          type: "final",
          entry: () => console.log("connectSafe.final"),
          data: context => context.data
        }
      }
    },
    {
      actions: processActions,
      services: {
        selectProfile:selectProfileMachine,
        connectEoa: connectEoaMachine,
        selectSafe: selectSafeMachine,
        addNewSafeOwner: addNewSafeOwnerMachine
      }
    }
  );
}