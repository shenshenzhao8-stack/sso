import { ElMessage, ElMessageBox } from 'element-plus'
import { dataAssetsFixedDel } from '@/api/assets-fixed'

export default function useHandleDeleteClick(
  refresh: Function
): (row: { [key: string]: any }) => void {
  return (row) => {
    ElMessageBox.confirm('确定删除该数据吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      dataAssetsFixedDel(row.id).then((res) => {
        if (res.code === 200) {
          refresh()
          ElMessage.success('删除成功')

          return
        }

        ElMessage.error(res.data.msg)
      })
    })
  }
}
