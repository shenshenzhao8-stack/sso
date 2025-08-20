import type { UserInfoType } from '@/api/common/types'

export interface DepartmentItem {
  id: number
  name: string
  level: number
  parent_department_id: number
  head_user: number
  head_user_info: UserInfoType
  creator: number
  created_at: string
  creator_info: UserInfoType
  updater: number
  updated_at: string
  updater_info: UserInfoType
  children?: DepartmentItem[]
}
