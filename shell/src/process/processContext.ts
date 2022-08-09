export type ProcessContext<TData> = {
  processId: string
  error?: Error
  data: TData
  isReEntry?: boolean
};