import { ElMessage, ElMessageBox } from 'element-plus'
import { dataPermissionsDelete } from '@/api/permissions'

export default function useHandleDeleteClick(refresh: Function): (id: number) => void {
  return (id) => {
    ElMessageBox.confirm('确定删除该角色？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      dataPermissionsDelete(id).then((res) => {
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
