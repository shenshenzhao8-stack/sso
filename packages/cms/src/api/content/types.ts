import type { TagInfoType } from '@/api/tag/type'

export interface ContentItemType {
  business_tags: TagInfoType[]
  content_tags: TagInfoType[]
  cover_picture_url: string
  created_at: number | string
  id: number
  title: string
  content: string
}
