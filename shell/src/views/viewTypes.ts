import {ViewEvent} from "./viewEventTypes";

export type ViewTypes =
  "HorizontalLayout" |
  "VerticalLayout" |
  "Title" |
  "Button" |
  "Html" |
  "SingleLineTextInput" |
  "AppList" |
  "MultiLineTextInput";

export type View = {
  id?:string,
  type: ViewTypes,
  params?: { [x: string]: any, cssClass?:string },
  inner?: View[]
  error?: any,
  tabIndex?: number
} & (
  HorizontalLayout
  | VerticalLayout
  | Title
  | Html
  | Button
  | SingleLineTextInput
  | MultiLineTextInput
  | AppList
);

export type HorizontalLayout = {
  type: "HorizontalLayout",
  params: {
    overflow: "scroll"|"wrap"|"justify-evenly"|"drop-down"
  },
  inner: View[]
};

export type VerticalLayout = {
  type: "VerticalLayout",
  inner: View[]
};

export type Title = {
  type: "Title",
  params: {
    text: string
  }
};

export type Button = {
  type: "Button",
  params: {
    text: string,
    event: ViewEvent|(() => void)
  }
};

export type Html = {
  type: "Html",
  params: {
    html: string
  }
};

export type AppList = {
  type: "AppList",
  params: {
    apps: {
      name: string,
      description: string,
      icon: string
    }[]
  }
};

export type ProfileList = {
  type: "ProfileList",
  params: {
  }
};

export type SingleLineTextInput = {
  id:string,
  type: "SingleLineTextInput",
  params: {
    autoFocus?: boolean,
    autocomplete?: boolean,
    placeholder?: string,
    value: string
  }
};

export type MultiLineTextInput = {
  id:string,
  type: "MultiLineTextInput",
  params: {
    autoFocus?: boolean,
    value: string
  }
};