export interface IRouterConfig {
  base: string
  items: {
    name: string
    url: string
    key: string
  }[]
}

export interface IConfig {
  router: IRouterConfig
}
