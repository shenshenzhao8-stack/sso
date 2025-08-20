export interface IPropsDataConfigurationDictionaryAdd {
  /**
   * 物品类别：1 固定资产，2 消耗品
   */
  category?: number
  /**
   * 物品类型
   */
  type?: string
}

export interface IPropsDataConfigurationDictionaryEdit
  extends IPropsDataConfigurationDictionaryAdd {
  id: number
}
