export interface UserLoginType {
  email: string
  password: string
}

export interface UserType {
  initial_password: number
  name: string
  email: string
  mobile: string
  /**
   * 1:在职 2:离职
   */
  status: number
  number: string
  address: string
  /**
   * 0:未知 1:男 2:女
   */
  sex: number
  level: string
  directorate: string
  id: number
  updated_at: string
}

export interface PaginationType {
  page: number
  page_size: number
  total: number
}

export interface UserListType {
  list: UserType[]
  pagination: PaginationType
}
