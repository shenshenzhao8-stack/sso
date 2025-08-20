import { ElMessage, ElMessageBox } from 'element-plus'
import { dataAssetsFixedRevert } from '@/api/assets-fixed'

const handleRevertClick = (row: { [key: string]: any }, refresh: Function) => {
  ElMessageBox.confirm('确定归还该设备吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    dataAssetsFixedRevert(row.id).then((res) => {
      if (res.code !== 200) {
        ElMessage.error(res?.msg || '归还失败')
        return
      }

      ElMessage.success('归还成功')

      refresh()
    })
  })
}

export default handleRevertClick
