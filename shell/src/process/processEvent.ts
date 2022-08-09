export type ProcessEvent =
  { processId?: string } & (
  { type: "nop" }
  | { type: "cancel" }
  | { type: "back" }
  | { type: "continue" }
  | {
    type: "submit",
    data: {
      id: string,
      value: any
    }
  }
  | { type: "skip" }
  | { type: "error" }
);