<script lang="tsx">
import { defineComponent, computed } from 'vue'
import { Collapse } from '@/components/Collapse'
import { SizeDropdown } from '@/components/SizeDropdown'
import { UserInfo } from '@/components/UserInfo'
import { Screenfull } from '@/components/Screenfull'
import { Breadcrumb } from '@/components/Breadcrumb'
import { useAppStore } from '@/stores/app'
import { ElMenu, ElMenuItem } from 'element-plus'
import { NavTabs } from '@/components/_Nav-tabs'

const appStore = useAppStore()

// 面包屑
const breadcrumb = computed(() => appStore.getBreadcrumb)

// 折叠图标
const hamburger = computed(() => appStore.getHamburger)

// 全屏图标
const screenfull = computed(() => appStore.getScreenfull)

// 尺寸图标
const size = computed(() => appStore.getSize)

// 布局
const layout = computed(() => appStore.getLayout)

const handleSelect = (e: string) => {
  if (e == '2') {
    window.location.replace(import.meta.env.VITE_USER_BASE_PATH)
  }
}

export default defineComponent({
  name: 'ToolHeader',
  setup() {
    return () => (
      <div
        id="tool-header"
        class={[
          'tool-header',
          'h-[var(--top-tool-height)] relative px-[var(--top-tool-p-x)] flex items-center justify-between'
        ]}
      >
        {layout.value !== 'top' ? (
          <div class="h-full flex items-center flex-grow-1">
            {hamburger.value && layout.value !== 'cutMenu' ? (
              <Collapse class="custom-hover" color="var(--top-header-text-color)"></Collapse>
            ) : undefined}
            {breadcrumb.value ? <Breadcrumb class="<md:hidden"></Breadcrumb> : undefined}
            {/* 新增顶部烂 */}
            <NavTabs />
          </div>
        ) : undefined}
        <div class="h-full flex items-center">
          {screenfull.value ? (
            <Screenfull class="custom-hover" color="var(--top-header-text-color)"></Screenfull>
          ) : undefined}
          {size.value ? (
            <SizeDropdown class="custom-hover" color="var(--top-header-text-color)"></SizeDropdown>
          ) : undefined}
          <UserInfo></UserInfo>
        </div>
      </div>
    )
  }
})
</script>

<style lang="less" scoped>
.tool-header {
  transition: left var(--transition-time-02);
}

.custom-hover:hover {
  background-color: var(--top-header-bg-color);
}

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
  }

  .el-menu-item.is-active {
    position: relative;
  }
}
</style>
