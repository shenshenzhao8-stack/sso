import { useMount } from '@mt-kit/vue-hooks'
import Drawer from './ui/drawer.vue'

export default function useHandleCreateEdit(refresh?: () => void): (id: number) => void {
  return (id: number) => {
    const dialogMount = useMount()

    dialogMount(Drawer, {
      refresh,
      id,
      dialogTitle: '编辑'
    })
  }
}
