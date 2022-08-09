export type ViewEvent =
  ({ type: "submit" }
  |{ type: "nop" }
  |{ type: "back" }
  |{ type: "skip" }
  |{ type: "continue" }
  |{ type: "keyPress", key: string, altKey:boolean, ctrlKey: boolean, shiftKey: boolean }
  |{ type: "cancel", processId: string });