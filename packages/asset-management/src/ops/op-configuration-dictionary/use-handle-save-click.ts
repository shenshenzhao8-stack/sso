import Dialog from './ui/dialog.vue'

import { useMount } from '@mt-kit/vue-hooks'

export default function useHandleSaveClick(refresh?: () => void): (row?: any) => void {
  return (row) => {
    const dialogMount = useMount()

    dialogMount(Dialog, {
      visible: true,
      data: row,
      refresh
    })
  }
}
