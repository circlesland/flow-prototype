import {Process} from "./process";
import {ProcessEvent} from "./processEvent";
import {StateMachine} from "xstate";
import {ProcessContext} from "./processContext";
import {ProcessViewModel} from "./processViewModel";
import {RuntimeProcess} from "./runtimeProcess";

export type ProcessDefinitionFactory<TData> = (process:Process<TData>) =>  StateMachine<ProcessContext<TData>, any, ProcessEvent>
export type PromptResult = ProcessEvent;
export type PromptPromiseService = (context:{data:any, processId:string}, event:{type:string}) => Promise<PromptResult>;
export type PromptPromiseServiceFactory<TData> = (process:RuntimeProcess<TData>, viewModel: ProcessViewModel) => PromptPromiseService;
export type PromptCallbackService = (context:{data:any, processId:string}, event:{type:string}) =>
  (callback:(event:ProcessEvent) => void) =>
    Promise<any>;
export type PromptCallbackServiceFactory<TData> = (process:RuntimeProcess<TData>, viewModel: ProcessViewModel) => PromptCallbackService;