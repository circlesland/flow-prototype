import {Process} from "./process";
import {ProcessHost} from "./processHost";
import {ProcessWindow} from "./processWindow";

export class RuntimeProcess<TContextData> {
  private readonly _processHost: ProcessHost;
  public readonly process: Process<TContextData>;
  public readonly processWindow: ProcessWindow;

  constructor(processHost: ProcessHost, processWindow: ProcessWindow, process: Process<TContextData>) {
    this.process = process;
    this.processWindow = processWindow;
    this._processHost = processHost;
  }
}