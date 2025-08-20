export interface AddTagDto {
  name: string
}

export interface UpdateTagDto extends AddTagDto {
  id: number
}

export interface TagInfoType {
  id: number
  name: string
  created_at?: string
  creator?: number
  updated_at?: string
  updater?: number
}
