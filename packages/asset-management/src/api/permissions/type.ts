export interface AssetManagementMenuItem {
  /**
   * 操作权限
   */
  actions?: string[]
  /**
   * API
   */
  api?: string
  /**
   * ID
   */
  id?: number
  /**
   * 路径
   */
  path?: string
}

export interface IParamsDataPermissionsCreate {
  description?: string
  permissions?: AssetManagementMenuItem[]
  role_name: string
  users?: number[]
}

export interface IParamsDataPermissionsEdit extends IParamsDataPermissionsCreate {
  id: number
}
