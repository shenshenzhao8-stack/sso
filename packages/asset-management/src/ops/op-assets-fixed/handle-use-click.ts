import Use from './ui/use.vue'

import { useMount } from '@mt-kit/vue-hooks'

const dialogMount = useMount()

const handleUseClick = (id: number, refresh: () => void) => {
  dialogMount(Use, {
    id,
    visible: true,
    refresh
  })
}
export default handleUseClick
