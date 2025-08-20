import JSon from './json.json'
import type { IRouterConfig } from './types'

export const canRouterMap = (mode: 'dev' | 'test' | 'pro' = 'dev'): IRouterConfig => {
  return {
    base: mode === 'dev' ? JSon[mode].proxy : JSon[mode].baseUrl,
    items: JSon[mode].item
      .map((value) => {
        if (value.key === 'sso') return null
        return {
          name: value.name,
          url: `${JSon[mode].baseUrl}${value.url}`,
          key: value.key
        }
      })
      .filter((item): item is { name: string; url: string; key: string } => item !== null)
  }
}
