import type { UserInfoType } from '@/api/common/types'

export interface DictItemType {
  created_at: string
  creator: number
  id: number
  is_system: boolean
  name: string
  type: number
  updated_at: string
  updater: number
  creator_info: UserInfoType
  updater_info: UserInfoType
}
