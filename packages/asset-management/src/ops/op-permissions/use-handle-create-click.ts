import { useMount } from '@mt-kit/vue-hooks'
import Drawer from './ui/drawer.vue'

export default function useHandleCreateClick(refresh?: () => void): () => void {
  return (row = {}) => {
    const dialogMount = useMount()

    dialogMount(Drawer, {
      refresh
    })
  }
}
