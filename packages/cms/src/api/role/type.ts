export interface AddRoleDto {
  role_name: string
  description: string
  users: number[]
  client_permissions: IClientPermissions[]
  manager_permissions: IManagerPermissions[]
  business_tags: number[]
  content_tags: number[]
}

interface IClientPermissions {
  path: string
  actions: string[]
}

interface IManagerPermissions {
  path: string
  actions: string[]
}
