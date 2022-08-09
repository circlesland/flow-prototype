import {assign, send, sendParent} from "xstate";
import {ProcessContext} from "./processContext";

export const processActions = {
  nop: send({
    type: "nop"
  }),
  onBackToParent: sendParent({
    type: "back"
  }),
  onError: assign({
    error: (ctx, e: any) => {
      console.log("processActions.onError:", e.data);
      return e.data;
    }
  }),
  onSubmit: assign({
    data: (ctx:ProcessContext<any>, e: any) => {
      const newData = {
        ...ctx.data,
        ...e.data
      };
      return newData;
    }
  }),
  submit: sendParent((context:ProcessContext<any>) => {
    return {
      type: "submit",
      data: context.data
    }
  })
};