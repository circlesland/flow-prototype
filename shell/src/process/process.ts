import {Readable} from "svelte/store";
import {Interpreter, State, StateMachine} from "xstate";
import {ProcessContext} from "./processContext";
import {ProcessEvent} from "./processEvent";
import {useMachine} from "xstate-svelte";
import {IProcessManifest, ProcessHost} from "./processHost";

export class Process<TData> {
  private static idCounter = 0;
  public readonly id: string;
  public readonly processManifest: IProcessManifest;
  private processDefinition: StateMachine<ProcessContext<TData>, any, ProcessEvent>;

  public get state(): Readable<State<ProcessContext<TData>, ProcessEvent, any, any>> {
    return this.machineState.state;
  }
  public get service(): Interpreter<ProcessContext<TData>, any, ProcessEvent, any> {
    return this.machineState.service;
  }

  private machineState: {
    state: Readable<State<ProcessContext<TData>, ProcessEvent, any, any>>;
    send: Interpreter<ProcessContext<TData>, any, ProcessEvent, any>['send'];
    service: Interpreter<ProcessContext<TData>, any, ProcessEvent, any>;
  };

  private readonly _processHost:ProcessHost;

  public get isRunning() {
    return !!this.processDefinition;
  }

  constructor(processHost:ProcessHost, processManifest: IProcessManifest) {
    this.id = (Process.idCounter++).toString();
    this.processManifest = processManifest;
    this._processHost = processHost;
  }

  run(definition: StateMachine<ProcessContext<TData>, any, ProcessEvent>, context?:ProcessContext<TData>, debug?: boolean)
  : Promise<{type: string, data: any}>{
    this.processDefinition = definition;

    this.machineState = useMachine(this.processDefinition, {
      context: context,
      devTools: debug
    });

    return new Promise((resolve) => {
      this.machineState.service.onDone(e => {
        resolve({type: e.type, data: e.data});
      });
    });
  }
}