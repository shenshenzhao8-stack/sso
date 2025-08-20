import type { RouteMeta } from 'vue-router'
import { Icon } from '@/components/Icon'

export const useRenderMenuTitle = () => {
  const renderMenuTitle = (meta: RouteMeta) => {
    const { title = '请设置标题', icon } = meta || {}

    return icon ? (
      <>
        {meta.icon?.includes('https') ? (
          <img src={meta.icon} width={10} height={10} class={'m-r10px'} />
        ) : (
          <Icon icon={meta.icon}></Icon>
        )}
        <span class="v-menu__title overflow-hidden overflow-ellipsis whitespace-nowrap">
          {title}
        </span>
      </>
    ) : (
      <span class="v-menu__title overflow-hidden overflow-ellipsis whitespace-nowrap">{title}</span>
    )
  }

  return {
    renderMenuTitle
  }
}
