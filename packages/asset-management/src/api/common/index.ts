import request from '@/axios'
import axios from 'axios'
import { ElMessage } from 'element-plus'

/**
 * 获取文件上传预签名url、key
 * @returns
 */
export const getFilePresignedUrlApi = (
  file: File
): Promise<IResponse<{ presigned_url: string; upload_key: string }>> => {
  const fileName = file.name
  let filePath = 'files'
  if (file.type.startsWith('image/')) {
    filePath = 'images'
  } else if (file.type.startsWith('video/')) {
    filePath = 'videos'
  } else {
    filePath = 'files'
  }
  return request.get({
    url: '/manager/file/presigned_url',
    params: { name: fileName, path: filePath }
  })
}

/**
 * 保存文件信息
 * @param data type:1公域,2私域
 * @returns
 */
export const saveFileInfo = (data: {
  upload_key: string
  type: number
  file_type: string
  origin_name: string
}): Promise<IResponse<{ url: string; id: number }>> => {
  return request.post({ url: '/manager/file/save', data })
}

export const uploadFile = async (file: File) => {
  const res = await getFilePresignedUrlApi(file)
  const data = await axios.put(res.data.presigned_url, file, {
    headers: { 'Content-Type': file.type }
  })
  if (data.status == 200) {
    const saveRes = await saveFileInfo({
      upload_key: res.data.upload_key,
      type: 1,
      file_type: file.type,
      origin_name: file.name
    })
    if (saveRes.code == 200) {
      // ElMessage.success('上传成功')
      return {
        id: saveRes.data?.id,
        url: saveRes.data.url
      }
    } else {
      ElMessage.error('上传失败')
    }
  } else {
    ElMessage.error('上传失败')
  }
}

export interface IUserType {
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

/**
 * 导入用户校验
 */
export const checkUserExistApi = (data: {
  emails: string[]
}): Promise<IResponse<{ exits?: IUserType[] }>> => {
  return request.post({ url: '/manager/users-check', data })
}

/**
 *
 * @param params type:1: 用户录入 2: 其他
 * @returns
 */
export const getFileTemplateApi = (params: { type: number }): Promise<IResponse<any>> => {
  return request.get({ url: '/manager/file/template', params, responseType: 'blob' })
}
