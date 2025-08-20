import { ElMessage, ElMessageBox } from 'element-plus'
import { dataAssetsConsumablesDelete } from '@/api/assets-consumables'

export default function useHandleDeleteClick(refresh: Function): (id: number) => void {
  return (id) => {
    ElMessageBox.confirm('确定删除该数据吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      dataAssetsConsumablesDelete(id).then((res) => {
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
