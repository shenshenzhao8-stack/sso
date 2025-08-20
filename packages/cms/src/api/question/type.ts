import type { TagInfoType } from '@/api/tag/type'

export interface AnswerInfoType {
  number: string
  answer: string
  /**
   * 附件
   */
  annex: string
  /**
   * 1:错误，2:正确
   */
  correct: number
  id: number
}

export interface QuestionItemType {
  id: number
  /**
   * 1:单选题，2:多选题，3:问答题，4:判断题
   */
  type: number
  business_tags: TagInfoType[]
  content_tags: TagInfoType[]
  answers: AnswerInfoType[]
  title: string
  annex: string
  score: number
  updated_at: string
  /**
   * 附件类型，用于判断是视频还是图片
   */
  annex_type: string
}
