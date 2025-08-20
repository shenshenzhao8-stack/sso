export interface DictExtraItemType {
  id: number
  dict_id: number
  name: string
  is_system: boolean
  creator: number
  created_at: string
  updater: number
  updated_at: string
}

export interface DictItemType {
  id: number
  name: string
  type: number
  is_system: boolean
  extra: DictExtraItemType[]
  creator: number
  created_at: string
  updater: number
  updated_at: string
}

export interface UserInfoType {
  email: string
  id: number
  name: string
}

export interface EmailGroupItemType {
  id?: number
  resignation_id?: number
  send_type: number
  user_id: number
  user_info: UserInfoType
}

export interface ResignationItemType {
  adjusted_leave: string
  approver_ids: number[]
  approver_info: UserInfoType[]
  compensation_type: number
  contract_belongs_to_id: number
  contract_belongs_to_info: any
  created_at: string
  creator: number
  creator_info: UserInfoType
  email_group: EmailGroupItemType[]
  id: number
  last_working_date_time: string
  liquidated_damages_type: number
  processing_date_time: string
  reason: string
  remaining_paid_leave: string
  remark: string
  status: number
  sub_type_id: number
  sub_type_info: any
  total_paid_leave: string
  type_id: number
  type_info: any
  updated_at: string
  updater: number
  updater_info: UserInfoType
  user_id: number
  user_info: UserInfoType
  user_type_id: number
  user_type_info: any
}
