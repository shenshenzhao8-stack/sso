/**
 * asset_management.CreateConsumableReq
 */
export interface IDataAssetsConsumablesAdd {
  /**
   * 品牌
   */
  brand?: string
  /**
   * 图片ID
   */
  img_id?: number
  /**
   * 物品名称
   */
  name?: string
  /**
   * 单价
   */
  price?: number
  /**
   * 库存
   */
  stock_num?: number
  /**
   * 物品类型ID
   */
  type?: number
  /**
   * 单位
   */
  unit?: string
}

export interface IDataAssetsConsumablesEdit extends IDataAssetsConsumablesAdd {
  id: number
}
