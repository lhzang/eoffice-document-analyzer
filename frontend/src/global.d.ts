//make property(s) optional
type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>
declare module '*.xlsx' {
  const src: string
  export default src
}
declare type THttpProblemDetails = {
  type?: string
  title?: string
  status?: number
  detail?: string
  instance?: string
  error_code?: string
}

declare type TServerError = AxiosError<THttpProblemDetails>
