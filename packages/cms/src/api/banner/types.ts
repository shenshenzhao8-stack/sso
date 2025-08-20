import type { TagInfoType } from '@/api/tag/type'

export interface BannerItemType {
  business_tags: TagInfoType[]
  content_tags: TagInfoType[]
  created_at: number | string
  id: number
  picture_url: string
  target_url: string
  title: string
}
