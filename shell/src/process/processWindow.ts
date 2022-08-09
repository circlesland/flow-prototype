import {ProcessHost} from "./processHost";
import {ViewEvent} from "../views/viewEventTypes";
import {ProcessViewModel} from "./processViewModel";
import {get, writable, Writable} from "svelte/store";
import {KeyboardEvents} from "./promptConfig";

export enum WindowState {
  Minimized,
  Floating,
  Maximized
}

export class ProcessWindowDimensions {
  x:number = 0;
  y:number = 0;
  w:number = 800;
  h:number = 600;
}

export class ProcessWindow {
  private readonly _processHost:ProcessHost;
  private readonly _wrappedWritableStore:  Writable<ProcessViewModel>;

  readonly processId:string;
  dimensions = new ProcessWindowDimensions();
  lastFloatingDimensions: ProcessWindowDimensions;

  private eventCallback:(event:ViewEvent) => void;
  private keyboardEvents: KeyboardEvents;

  public get cancelRequested() : boolean {
    return this._cancelRequested;
  }
  private _cancelRequested: boolean = false;

  public isMoving: boolean = false;
  public isMouseDown: boolean = false;

  public get windowState() {
    return this._windowState;
  }
  public set windowState(value:WindowState) {
    this._windowState = value;
  }
  private _windowState: WindowState;
  previousWindowState:WindowState|undefined;

  constructor(processHost:ProcessHost, processId:string) {
    this._processHost = processHost;
    this.processId = processId;
    this._wrappedWritableStore = writable<ProcessViewModel>(
      {
        views: [],
        navigation: {
          canNavigate: false
        }
      }
    );
    this._windowState = WindowState.Floating;
  }

  get title():string {
    return this._title;
  }
  set title(title:string) {
    this._title = title;
  }
  private _title:string = "";

  get z():number {
    return this._processHost.getZIndex(this.processId);
  }

  get isFocused() : boolean {
    return this._processHost.isFocused(this.processId);
  }

  setViewModel(viewModel:ProcessViewModel) {
    this._wrappedWritableStore.set(viewModel);
    this.keyboardEvents = viewModel.keyboardEvents;
  }

  public get isDirty() {
    return this._isDirty;
  }
  private _isDirty: boolean = false;

  minimize() {
    this._processHost.minimize(this.processId);
    this._windowState = WindowState.Minimized;
  }

  float() {
    this._processHost.float(this.processId);
    this._windowState = WindowState.Floating;
  }

  restoreWindowState() {
    this._windowState = this._processHost.restoreWindowState(this.processId);
  }

  maximize() {
    this._processHost.maximize(this.processId);
    this._windowState = WindowState.Maximized;
  }

  sendEvent(event:ViewEvent) {
    if (event.type == "submit") {
      this._isDirty = true;
    }
    if (event.type == "keyPress") {
      if (!this.keyboardEvents)
        return;

      let keyboardEvent: (processId:string) => ViewEvent|undefined = undefined;
      if (event.ctrlKey) {
        keyboardEvent = this.keyboardEvents[`${event.ctrlKey ? 'Control+' : ''}${event.key}`]
      } else if (event.shiftKey) {
        keyboardEvent = this.keyboardEvents[`${event.shiftKey ? 'Shift+' : ''}${event.key}`]
      } else {
        keyboardEvent = this.keyboardEvents[`${event.key}`]
      }
      if (keyboardEvent){
        const e = keyboardEvent(this.processId);
        if (e) {
          this.sendEvent(e);
          return true;
        }
      }
    } else if (this.eventCallback) {
      this.eventCallback(event);
      return true;
    }

    return false;
  }

  onEvent(callback:(event:ViewEvent) => void) {
    this.eventCallback = callback;
  }

  subscribe(run: (next:ProcessViewModel) => void) {
    return this._wrappedWritableStore.subscribe(run);
  }

  continue() {
    this._cancelRequested = false;
    this._wrappedWritableStore.set(get(this._wrappedWritableStore));
  }

  requestCancel() {
    this._cancelRequested = true;
    this._wrappedWritableStore.set(get(this._wrappedWritableStore));
  }
}