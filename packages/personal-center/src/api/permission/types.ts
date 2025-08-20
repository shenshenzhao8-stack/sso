import type { UserInfoType } from '@/api/common/types'

export interface RolePermissionsInfoType {
  id: number
  name: string
  server_code: string
  selected?: boolean
}

export interface RoleItemType {
  created_at: string
  creator: number
  creator_info: UserInfoType
  description: string
  id: number
  name: string
  role_permissions_info: RolePermissionsInfoType[]
  role_users_info: UserInfoType[]
  updated_at: string
  updater: number
  updater_info: UserInfoType
}
