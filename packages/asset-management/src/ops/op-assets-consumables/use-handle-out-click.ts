import Dialog from './ui/out-dialog.vue'

import { useMount } from '@mt-kit/vue-hooks'

export default function useHandleOutClick(refresh?: () => void): (id: number) => void {
  return (id: number) => {
    const dialogMount = useMount()

    dialogMount(Dialog, {
      visible: true,
      id: id,
      refresh
    })
  }
}
