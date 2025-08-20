<script lang="tsx">
import {
  computed,
  defineComponent,
  unref,
  type PropType,
  ref,
  onMounted,
  nextTick,
  watch
} from 'vue'
import { ElMenu, ElMessage, ElMessageBox, ElScrollbar } from 'element-plus'
import { useAppStore } from '@/stores/app'
import { useMenuStore } from '@/stores/menuView'
import { useRenderMenuItem } from './components/useRenderMenuItem'
import { useRouter } from 'vue-router'
import { isUrl } from '@/utils/is'
import { isArray } from 'lodash-es'

import { getMenuListApi } from '@/api/menu'
import { useUserStore } from '@/stores/user'

export default defineComponent({
  name: 'Menu',
  props: {
    menuSelect: {
      type: Function as PropType<(index: string) => void>,
      default: undefined
    }
  },
  setup(props) {
    const appStore = useAppStore()

    const userStore = useUserStore()

    const layout = computed(() => appStore.getLayout)

    const { push, currentRoute } = useRouter()

    const menuStore = useMenuStore()

    const menuMode = computed((): 'vertical' | 'horizontal' => {
      // 竖
      const vertical: LayoutType[] = ['classic', 'topLeft', 'cutMenu']

      if (vertical.includes(unref(layout))) {
        return 'vertical'
      } else {
        return 'horizontal'
      }
    })

    const menuList = computed(() => menuStore.getMenuList)

    const collapse = computed(() => appStore.getCollapse)

    const uniqueOpened = computed(() => appStore.getUniqueOpened)

    const activeMenu = ref<string>('')
    const getActiveMenu = () => {
      const { meta, path } = unref(currentRoute)
      // if set path, the sidebar will highlight the path you set

      if (meta.activeMenu) {
        return meta.activeMenu as string
      }

      return path
    }

    watch(
      () => currentRoute.value.fullPath,
      () => {
        activeMenu.value = getActiveMenu()
      },
      { immediate: true }
    )

    // 获取角色信息
    const getRole = async () => {
      const res = await getMenuListApi()
      if (res?.code == 200) {
        const routers = isArray(res?.data) ? res?.data : []

        if (routers?.length == 0) {
          ElMessage.error('暂无权限，请联系管理员')
        } else {
          const menuList = menuStore.initMenuRouter(routers)
          menuStore.setMenuList(menuList)
        }
      }
    }

    const menuSelect = (index: string) => {
      if (props.menuSelect) {
        props.menuSelect(index)
      } else {
        activeMenu.value = ''
        nextTick(() => {
          activeMenu.value = getActiveMenu()
        })
      }
      // 自定义事件
      if (isUrl(index)) {
        window.open(index)
      } else {
        push(index)
      }
    }

    const renderMenuWrap = () => {
      if (unref(layout) === 'top') {
        return renderMenu()
      } else {
        return <ElScrollbar>{renderMenu()}</ElScrollbar>
      }
    }

    const renderMenu = () => {
      return (
        <ElMenu
          defaultActive={unref(activeMenu)}
          mode={unref(menuMode)}
          collapse={
            unref(layout) === 'top' || unref(layout) === 'cutMenu' ? false : unref(collapse)
          }
          uniqueOpened={unref(layout) === 'top' ? false : unref(uniqueOpened)}
          backgroundColor="var(--left-menu-bg-color)"
          textColor="var(--left-menu-text-color)"
          activeTextColor="var(--left-menu-text-active-color)"
          onSelect={menuSelect}
        >
          {{
            default: () => {
              const { renderMenuItem } = useRenderMenuItem(unref(menuMode))
              return renderMenuItem(unref(menuList))
            }
          }}
        </ElMenu>
      )
    }

    onMounted(() => {
      getRole()
    })

    return () => (
      <div
        id="menu"
        class={[
          `menu menu__${unref(menuMode)}`,
          'h-[100%] overflow-hidden flex-col bg-[var(--left-menu-bg-color)]',
          {
            'w-[var(--left-menu-min-width)]': unref(collapse) && unref(layout) !== 'cutMenu',
            'w-[var(--left-menu-max-width)]': !unref(collapse) && unref(layout) !== 'cutMenu'
          }
        ]}
      >
        {renderMenuWrap()}
      </div>
    )
  }
})
</script>

<style lang="less" scoped>
.menu {
  position: relative;
  transition: width var(--transition-time-02);

  :deep(.el-menu) {
    width: 100% !important;
    border-right: none;

    // 设置选中时子标题的颜色
    .is-active {
      & > .el-sub-menu__title {
        color: var(--left-menu-text-active-color) !important;
      }
    }

    // 设置子菜单悬停的高亮和背景色
    .el-sub-menu__title,
    .el-menu-item {
      &:hover {
        color: var(--left-menu-text-active-color) !important;
        background-color: var(--left-menu-bg-color) !important;
      }
    }

    // 设置选中时的高亮背景和高亮颜色
    .el-menu-item.is-active {
      color: var(--left-menu-text-active-color) !important;
      background-color: var(--left-menu-bg-active-color) !important;

      &:hover {
        background-color: var(--left-menu-bg-active-color) !important;
      }
    }

    .el-menu-item.is-active {
      position: relative;
    }

    // 设置子菜单的背景颜色
    .el-menu {
      .el-sub-menu__title,
      .el-menu-item:not(.is-active) {
        background-color: var(--left-menu-bg-light-color) !important;
      }
    }
  }

  // 折叠时的最小宽度
  :deep(.el-menu--collapse) {
    width: var(--left-menu-min-width);

    & > .is-active,
    & > .is-active > .el-sub-menu__title {
      position: relative;
      background-color: var(--left-menu-collapse-bg-active-color) !important;
    }
  }

  // 折叠动画的时候，就需要把文字给隐藏掉
  :deep(.horizontal-collapse-transition) {
    .menu__title {
      display: none;
    }
  }

  // 水平菜单
  &__horizontal {
    height: calc(~'var(--top-tool-height)') !important;

    :deep(.el-menu--horizontal) {
      height: calc(~'var(--top-tool-height)');
      border-bottom: none;
      // 重新设置底部高亮颜色
      & > .el-sub-menu.is-active {
        .el-sub-menu__title {
          border-bottom-color: var(--el-color-primary) !important;
        }
      }

      .el-menu-item.is-active {
        position: relative;

        &::after {
          display: none !important;
        }
      }

      .menu__title {
        /* stylelint-disable-next-line */
        max-height: calc(~'var(--top-tool-height) - 2px') !important;
        /* stylelint-disable-next-line */
        line-height: calc(~'var(--top-tool-height) - 2px');
      }
    }
  }
}
</style>

<style lang="less">
.menu-popper--vertical,
.menu-popper--horizontal {
  // 设置选中时子标题的颜色
  .is-active {
    & > .el-sub-menu__title {
      color: var(--left-menu-text-active-color) !important;
    }
  }

  // 设置子菜单悬停的高亮和背景色
  .el-sub-menu__title,
  .el-menu-item {
    &:hover {
      color: var(--left-menu-text-active-color) !important;
      background-color: var(--left-menu-bg-color) !important;
    }
  }

  // 设置选中时的高亮背景
  .el-menu-item.is-active {
    position: relative;
    background-color: var(--left-menu-bg-active-color) !important;

    &:hover {
      background-color: var(--left-menu-bg-active-color) !important;
    }
  }
}

// 设置子菜单溢出时滚动样式
.submenu-popper--vertical {
  max-height: 100%;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
    background-color: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgb(144 147 153 / 30%);
    border-radius: 4px;
  }
}
</style>
