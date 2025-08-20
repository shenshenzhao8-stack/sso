import { createRouter, createWebHashHistory } from 'vue-router'
import type {
  Router,
  RouteLocationNormalized,
  RouteRecordNormalized,
  RouteRecordRaw
} from 'vue-router'
import { isUrl } from '@/utils/is'
import { omit, cloneDeep } from 'lodash-es'

const modules = import.meta.glob('../views/**/*.{vue,tsx}')

/* Layout */
export const Layout = () => import('@/layout/Layout.vue')

export const getParentLayout = () => {
  return () =>
    new Promise((resolve) => {
      resolve({
        name: 'ParentLayout'
      })
    })
}

export const getRawRoute = (route: RouteLocationNormalized): RouteLocationNormalized => {
  if (!route) return route
  const { matched, ...opt } = route
  return {
    ...opt,
    matched: (matched
      ? matched.map((item) => ({
          meta: item.meta,
          name: item.name,
          path: item.path
        }))
      : undefined) as RouteRecordNormalized[]
  }
}

// 前端控制路由生成
export const generateRoutesByFrontEnd = (
  routes: AppRouteRecordRaw[],
  keys: string[],
  basePath = '/'
): AppRouteRecordRaw[] => {
  const res: AppRouteRecordRaw[] = []

  for (const route of routes) {
    const meta = route.meta ?? {}
    // skip some route
    if (meta.hidden && !meta.canTo) {
      continue
    }

    let data: Nullable<AppRouteRecordRaw> = null

    let onlyOneChild: Nullable<string> = null
    if (route.children && route.children.length === 1 && !meta.alwaysShow) {
      onlyOneChild = (
        isUrl(route.children[0].path)
          ? route.children[0].path
          : pathResolve(pathResolve(basePath, route.path), route.children[0].path)
      ) as string
    }

    // 开发者可以根据实际情况进行扩展
    for (const item of keys) {
      // 通过路径去匹配
      if (isUrl(item) && (onlyOneChild === item || route.path === item)) {
        data = Object.assign({}, route)
      } else {
        const routePath = (onlyOneChild ?? pathResolve(basePath, route.path)).trim()
        if (routePath === item || meta.followRoute === item) {
          data = Object.assign({}, route)
        }
      }
    }

    // recursive child routes
    if (route.children && data) {
      data.children = generateRoutesByFrontEnd(
        route.children,
        keys,
        pathResolve(basePath, data.path)
      )
    }
    if (data) {
      res.push(data as AppRouteRecordRaw)
    }
  }
  return res
}

// 后端控制路由生成
export const generateRoutesByServer = (routes: AppCustomRouteRecordRaw[]): AppRouteRecordRaw[] => {
  const res: AppRouteRecordRaw[] = []

  for (const route of routes) {
    const data: AppRouteRecordRaw = {
      path: route.path,
      name: route.name,
      redirect: route.redirect,
      meta: route.meta
    }
    if (route.component) {
      const comModule = modules[`../${route.component}.vue`] || modules[`../${route.component}.tsx`]
      const component = route.component as string
      if (!comModule && !component.includes('#')) {
        console.error(`未找到${route.component}.vue文件或${route.component}.tsx文件，请创建`)
      } else {
        // 动态加载路由文件，可根据实际情况进行自定义逻辑
        data.component =
          component === '#' ? Layout : component.includes('##') ? getParentLayout() : comModule
      }
    }
    // recursive child routes
    if (route.children) {
      data.children = generateRoutesByServer(route.children)
    }
    res.push(data as AppRouteRecordRaw)
  }
  return res
}

export const pathResolve = (parentPath: string, path: string) => {
  if (isUrl(path)) return path
  const childPath = path.startsWith('/') || !path ? path : `/${path}`
  return `${parentPath}${childPath}`.replace(/\/\//g, '/').trim()
}

// 路由降级
export const flatMultiLevelRoutes = (routes: AppRouteRecordRaw[]) => {
  const modules: AppRouteRecordRaw[] = cloneDeep(routes)
  for (let index = 0; index < modules.length; index++) {
    const route = modules[index]
    if (!isMultipleRoute(route)) {
      continue
    }
    promoteRouteLevel(route)
  }
  return modules
}

// 层级是否大于2
const isMultipleRoute = (route: AppRouteRecordRaw) => {
  if (!route || !Reflect.has(route, 'children') || !route.children?.length) {
    return false
  }

  const children = route.children

  let flag = false
  for (let index = 0; index < children.length; index++) {
    const child = children[index]
    if (child.children?.length) {
      flag = true
      break
    }
  }
  return flag
}

// 生成二级路由
const promoteRouteLevel = (route: AppRouteRecordRaw) => {
  let router: Router | null = createRouter({
    routes: [route as RouteRecordRaw],
    history: createWebHashHistory()
  })

  const routes = router.getRoutes()
  addToChildren(routes, route.children || [], route)
  router = null

  route.children = route.children?.map((item) => omit(item, 'children'))
}

// 添加所有子菜单
const addToChildren = (
  routes: RouteRecordNormalized[],
  children: AppRouteRecordRaw[],
  routeModule: AppRouteRecordRaw
) => {
  for (let index = 0; index < children.length; index++) {
    const child = children[index]
    const route = routes.find((item) => item.name === child.name)
    if (!route) {
      continue
    }
    routeModule.children = routeModule.children || []
    if (!routeModule.children.find((item) => item.name === route.name)) {
      routeModule.children?.push(route as unknown as AppRouteRecordRaw)
    }
    if (child.children?.length) {
      addToChildren(routes, child.children, routeModule)
    }
  }
}

/**
 * 根据接口返回的路由权限数据，过滤并添加权限到原始路由配置
 * @param rawRoutes 原始路由配置数组
 * @param apiRoutes 接口返回的路由权限数据，包含路径和权限信息
 * @returns 处理后的路由配置数组
 *
 * 主要功能：
 * 1. 构建权限映射表：将接口返回的路由权限数据转换为路径-权限的映射关系
 * 2. 处理权限继承：支持从指定路由继承权限
 * 3. 递归处理子路由：确保所有层级的路由都能正确获取权限
 * 4. 自动补全redirect：为包含子路由的父级路由自动设置重定向路径
 * 5. 过滤无效路由：根据权限信息过滤掉无权限访问的路由
 *
 * 处理逻辑：
 * - 保留通配符路由（如404页面）
 * - 忽略设置了ignorePermission的路由
 * - 支持路由权限继承（通过inheritRoutePermissions）
 * - 自动为父级路由设置重定向到第一个有效子路由
 * - 保留至少有一个有效子路由的父级路由
 */
export function filterAsyncRouterMap(
  rawRoutes: AppRouteRecordRaw[],
  apiRoutes: {
    path: string
    actions?: string[] | null
    children?: { path: string; actions?: string[] | null }[]
  }[]
): AppRouteRecordRaw[] {
  // 步骤1：构建权限映射表
  const apiPathMap: Record<string, string[] | undefined> = {} // 创建空对象用于存储路径-权限映射

  // 立即执行函数，递归构建权限映射表
  ;(function buildApiPathMap(routes: typeof apiRoutes) {
    routes.forEach((route) => {
      // 清理路径，移除动态参数和结尾斜杠
      const cleanPath = route.path.replace(/\/:.*|\/$/g, '')
      // 将路径和权限信息存入映射表
      apiPathMap[cleanPath] = route.actions || undefined
      // 递归处理子路由
      if (route.children) buildApiPathMap(route.children)
    })
  })(apiRoutes)

  // 步骤2：判断是否需要排除重定向目标
  function shouldExcludeRedirect(meta?: AppRouteRecordRaw['meta']): boolean {
    return (
      !!meta &&
      (meta.hidden === true || // 路由是否隐藏
        meta.ignorePermission === true || // 是否忽略权限
        meta.activeMenu != null || // 是否有激活菜单
        meta.inheritRoutePermissions != null) // 是否继承权限
    )
  }

  // 步骤3：递归检查子路由是否存在有效权限
  function hasValidChild(children: AppRouteRecordRaw[], parentFullPath: string): boolean {
    return children.some((child) => {
      // 计算子路由完整路径
      const childFullPath = child.path.startsWith('/')
        ? child.path
        : [parentFullPath, child.path].filter(Boolean).join('/')

      // 标准化路径
      const normalized = childFullPath.replace(/\/:.*|\/$/g, '')

      // 情况1：当前子路由有权限
      if (apiPathMap.hasOwnProperty(normalized)) return true

      // 情况2：递归检查孙子路由
      if (child.children?.length) {
        return hasValidChild(child.children, childFullPath)
      }

      return false
    })
  }

  // 步骤4：核心处理逻辑
  function processRoutes(routes: AppRouteRecordRaw[], parentPath = ''): AppRouteRecordRaw[] {
    return routes
      .map((r) => ({ ...r })) // 浅拷贝路由对象，避免修改原始数据
      .map((route) => {
        // 新增：注入当前路由自身权限
        const currentFullPath = route.path.startsWith('/')
          ? route.path
          : [parentPath, route.path].filter(Boolean).join('/')

        const normalizedCurrentPath = currentFullPath.replace(/\/:.*|\/$/g, '')

        if (apiPathMap[normalizedCurrentPath]) {
          route.meta = route.meta || {}
          route.meta.permission = apiPathMap[normalizedCurrentPath]
        }

        // 处理权限继承：如果当前路由配置了继承其他路由的权限
        if (route.meta?.inheritRoutePermissions) {
          const inheritRaw = route.meta.inheritRoutePermissions
          // 计算继承路径：如果继承路径是相对路径，则拼接父路径
          const inheritPath = inheritRaw.startsWith('/')
            ? inheritRaw
            : [parentPath, inheritRaw].filter(Boolean).join('/')
          // 从权限映射表中获取继承的权限
          route.meta.permission = apiPathMap[inheritPath] || undefined
        }
        return route
      })
      .map((route) => {
        // 处理子路由：递归处理当前路由的所有子路由
        const fullPath = route.path.startsWith('/')
          ? route.path
          : [parentPath, route.path].filter(Boolean).join('/')
        if (route.children) {
          // 递归处理子路由，并传递当前路径作为父路径
          route.children = processRoutes(route.children, fullPath)
        }
        return route
      })
      .filter((route) => {
        // 始终保留通配符路由（如404页面）
        if (route.path === '/:path(.*)*' || route.path === '/:pathMatch(.*)') {
          return true
        }

        // 忽略权限检查的路由直接保留
        if (route.meta?.ignorePermission) return true

        // 计算当前路由的完整路径
        const fullPath = route.path.startsWith('/')
          ? route.path
          : [parentPath, route.path].filter(Boolean).join('/')
        // 标准化路径：移除动态参数和结尾斜杠
        const normalizedPath = fullPath.replace(/\/:.*|\/$/g, '')
        // 检查当前路由是否有直接权限
        const hasSelfPerm = apiPathMap.hasOwnProperty(normalizedPath)

        // 检查有效子路由：如果当前路由没有直接权限，但至少有一个子路由有权限
        const hasValidChildren = route.children?.length
          ? hasValidChild(route.children, fullPath)
          : false

        // 保留条件：当前路由有权限 或 至少有一个子路由有权限
        return hasSelfPerm || hasValidChildren
      })
      .map((route) => {
        // 自动补全 redirect：为包含子路由的父级路由设置重定向路径
        if (route.children?.length) {
          // 寻找第一个有效子路由：排除需要排除的重定向目标
          const validChild =
            route.children.find((child) => !shouldExcludeRedirect(child.meta)) || route.children[0]

          // 构建绝对路径：如果子路由路径是相对路径，则拼接父路径
          const childPath = validChild.path.startsWith('/')
            ? validChild.path
            : `/${route.path}/${validChild.path}`.replace(/\/+/g, '/')

          // 设置重定向路径
          route.redirect = childPath
        }
        return route
      })
  }

  // 返回处理后的路由配置
  return processRoutes(rawRoutes)
}
