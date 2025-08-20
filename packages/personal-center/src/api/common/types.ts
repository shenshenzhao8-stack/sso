export interface PaginationInfoType {
  page: number
  limit: number
  total: number
}

export interface UserInfoType {
  id: number
  name: string
  email: string
  initial_password?: number
  mobile?: string
  /**
   * 1:在职 2:离职 3:离项中 4:待岗中
   */
  status?: number
  number?: string
  address?: string
  /**
   * 0:未知 1:男 2:女
   */
  sex?: number
  level?: string
  directorate?: string
  updated_at?: string

  position: string
  department_info: any
  project_info: any
  contract_info: any
  remark: string
  created_at: string
}
