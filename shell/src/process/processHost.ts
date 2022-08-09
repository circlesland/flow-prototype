import {Process} from "./process";
import {NameData} from "../dapps/passport/processes/updateName";
import {StateMachine} from "xstate";
import {ProcessContext} from "./processContext";
import {ProcessEvent} from "./processEvent";
import {readable} from "svelte/store";
import {RuntimeProcess} from "./runtimeProcess";
import {ProcessWindow, ProcessWindowDimensions, WindowState} from "./processWindow";
import {inspect, Inspector} from "@xstate/inspect";

export class IProcessManifest {
  public readonly process:string;
  public readonly segment:string;
  public readonly icon:string|undefined;
  public readonly name:string;
  public readonly description:string|undefined;
  public readonly factory: (process:RuntimeProcess<NameData>) => StateMachine<ProcessContext<any>, any, ProcessEvent>;
}

export class ProcessHost {

  public static get instance() {
    if (!this._instance) {
      this._instance = new ProcessHost();
    }
    return this._instance;
  }
  private static _instance: ProcessHost;

  private _setProcessesByZIndex:any;
  public readonly processesByZIndex = readable<RuntimeProcess<any>[]>([], (set) => {
    this._setProcessesByZIndex = set;
    return () => {};
  });

  private _setProcessesById:any;
  public readonly processesById = readable<RuntimeProcess<any>[]>([], (set) => {
    this._setProcessesById = set;
    return () => {};
  });

  private _setProcessesLibrary:any;
  public readonly processesLibrary = readable<RuntimeProcess<any>[]>([], (set) => {
    this._setProcessesLibrary = set;
    return () => {};
  });

  private readonly _processTypes: {
    [type:string]: IProcessManifest
  } = {};

  private readonly _runningProcessesByZIndex: RuntimeProcess<any>[] = [];
  private readonly _minimizedProcesses: RuntimeProcess<any>[] = [];

  private _lastSpawnedWindow:ProcessWindow|undefined;
  public nextSpawnPosition: {x:number, y:number}|undefined = undefined;

  private _inspector: Inspector;

  private constructor() {
  }

  register(manifest:IProcessManifest) {
    this.processesLibrary.subscribe(() => {})();
    const key = manifest.process == manifest.segment
      ? `${manifest.process}`
      :`${manifest.process}|${manifest.segment}`;

    this._processTypes[key] = manifest;
    this._setProcessesLibrary(Object.values(this._processTypes))
  }

  private get allProcesses(): RuntimeProcess<any> [] {
    return this._minimizedProcesses.concat(this._runningProcessesByZIndex);
  }

  run(type:string, context?: ProcessContext<any>, debug?:boolean) {
    const manifest = this._processTypes[type];
    if (!manifest) {
      throw new Error(`Couldn't find a manifest for type: ${type}`)
    }

    if (debug && !this._inspector) {
      this._inspector = inspect({
        iframe: false // open in new window
      });
      this._inspector.subscribe(o => {
        console.log("From inspector:", o);
      })
    }

    const process = new Process<any>(this, manifest);
    const runtimeProcess = this.addRuntimeProcess(process);
    process.run(manifest.factory(runtimeProcess), context, debug)
      .then(() => {
        this.removeProcess(process.id);
      });
  }

  minimize(id:string) {
    const exists = this._runningProcessesByZIndex.find((o) => o.process.id == id);
    if (!exists) {
      throw new Error("Couldn't find a process with id: " + id);
    }
    if (exists.processWindow.windowState == WindowState.Minimized)
      return;

    exists.processWindow.previousWindowState = exists.processWindow.windowState;
    exists.processWindow.lastFloatingDimensions = JSON.parse(JSON.stringify(exists.processWindow.dimensions));

    const idx = this._runningProcessesByZIndex.indexOf(exists);
    const splice = this._runningProcessesByZIndex.splice(idx, 1);
    this._minimizedProcesses.push(splice[0]);

    this.refresh();
  }

  float(id:string) {
    const exists = this.allProcesses.find((o) => o.process.id == id);
    if (!exists) {
      throw new Error("Couldn't find a process with id: " + id);
    }
    if (exists.processWindow.windowState == WindowState.Floating)
      return;

    exists.processWindow.dimensions = exists.processWindow.lastFloatingDimensions
      ? exists.processWindow.lastFloatingDimensions
      : new ProcessWindowDimensions();

    this.refresh();
  }

  isCancelling(id:string) : boolean {
    const exists = this.allProcesses.find((o) => o.process.id == id);
    if (!exists) {
      throw new Error("Couldn't find a process with id: " + id);
    }
    return exists.processWindow.cancelRequested;
  }

  restoreWindowState(id:string) : WindowState {
    const exists = this.allProcesses.find((o) => o.process.id == id);
    if (!exists) {
      throw new Error("Couldn't find a process with id: " + id);
    }
    if (!exists.processWindow.previousWindowState) {
      return;
    }
    const pState = exists.processWindow.previousWindowState;
    exists.processWindow.previousWindowState = undefined;
    return pState;
  }

  maximize(id:string) {
    const exists = this.allProcesses.find((o) => o.process.id == id);
    if (!exists) {
      throw new Error("Couldn't find a process with id: " + id);
    }
    if (exists.processWindow.windowState == WindowState.Maximized)
      return;

    exists.processWindow.previousWindowState = exists.processWindow.windowState;
    exists.processWindow.lastFloatingDimensions = JSON.parse(JSON.stringify(exists.processWindow.dimensions));

    this.refresh();
  }

  focus(id:string) {
    const exists = this.allProcesses.find((o) => o.process.id == id);
    if (!exists) {
      throw new Error("Couldn't find a process with id: " + id);
    }

    const minimizedProcessIdx = this._minimizedProcesses.indexOf(exists);
    if (minimizedProcessIdx >= 0) {
      this._minimizedProcesses.splice(minimizedProcessIdx, 1);
    }

    const visibleProcessIdx = this._runningProcessesByZIndex.indexOf(exists);
    if (visibleProcessIdx >= 0) {
      const splice = this._runningProcessesByZIndex.splice(visibleProcessIdx, 1);
      this._runningProcessesByZIndex.push(splice[0]);
      if (splice[0].processWindow.windowState == WindowState.Minimized) {
        splice[0].processWindow.restoreWindowState();
      }
    } else {
      this._runningProcessesByZIndex.push(exists);
      if (exists.processWindow.windowState == WindowState.Minimized) {
        exists.processWindow.restoreWindowState();
      }
    }

    this.refresh();
  }

  isFocused(id: string) {
    if (this._runningProcessesByZIndex.length == 0) {
      return false;
    }
    const focusedProcess = this._runningProcessesByZIndex[this._runningProcessesByZIndex.length - 1];
    return focusedProcess.process.id == id;
  }

  getZIndex(id: string) {
    const runtimeProcess = this._runningProcessesByZIndex.find(o => o.process.id == id);
    return this._runningProcessesByZIndex.indexOf(runtimeProcess);
  }

  refresh() {
    const processesById = this.allProcesses
      .map(o => o)
      .sort((a, b) =>
        a.process.id > b.process.id
          ? 1
          : a.process.id < b.process.id
            ? -1
            : 0);

    this._setProcessesById(processesById.map(o => o));
    this._setProcessesByZIndex(this._runningProcessesByZIndex.map(o => o));
  }

  private addRuntimeProcess(process:Process<any>) : RuntimeProcess<any> {
    const exists = this._runningProcessesByZIndex.find(o => o.process.id == process.id);
    if (exists) {
      throw new Error("A process with the supplied id already exists: " + process.id);
    }

    const processWindow = new ProcessWindow(this, process.id);
    processWindow.title = `${process.processManifest.name}`;
    if (this._lastSpawnedWindow) {
      processWindow.dimensions.x = this._lastSpawnedWindow.dimensions.x + 30;
      processWindow.dimensions.y = this._lastSpawnedWindow.dimensions.y + 25;
    }
    if (this.nextSpawnPosition) {
      processWindow.dimensions.x = this.nextSpawnPosition.x + 30;
      processWindow.dimensions.y = this.nextSpawnPosition.y + 25;
      this.nextSpawnPosition = undefined;
    }
    if (this._lastSpawnedWindow && this._lastSpawnedWindow.windowState !== WindowState.Minimized) {
      processWindow.windowState = this._lastSpawnedWindow.windowState;
    }
    this._lastSpawnedWindow = processWindow;

    const runtimeProcess = new RuntimeProcess<any>(this, processWindow, process);
    this._runningProcessesByZIndex.push(runtimeProcess);

    this.focus(process.id);

    return runtimeProcess;
  }

  private removeProcess(id:string) {
    const exists = this._runningProcessesByZIndex.find((o) => o.process.id == id);
    if (!exists) {
      throw new Error("Couldn't find a process with id: " + id);
    }
    const idx = this._runningProcessesByZIndex.indexOf(exists);
    this._runningProcessesByZIndex.splice(idx, 1);

    this.refresh();
  }
}