import { ElMessage, ElMessageBox } from 'element-plus'
import { dataAssetsFixedDeprecated } from '@/api/assets-fixed'
const handleDeprecatedClick = (row: { [key: string]: any }, refresh: Function) => {
  ElMessageBox.confirm('确定报废该设备吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    dataAssetsFixedDeprecated(row.id).then((res) => {
      if (res.code !== 200) {
        ElMessage.error(res.msg)
        return
      }
      ElMessage.success('报废成功')
      refresh()
    })
  })
}
export default handleDeprecatedClick
