<script setup lang="ts">
import {
  onBeforeUnmount,
  computed,
  type PropType,
  unref,
  nextTick,
  ref,
  watch,
  shallowRef
} from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import type { IDomEditor, IEditorConfig } from '@wangeditor/editor'
import { propTypes } from '@/utils/propTypes'
import { isNumber } from '@/utils/is'
import { ElLoading, ElMessage } from 'element-plus'
import { uploadFile } from '@/api/common'

const props = defineProps({
  editorId: propTypes.string.def('wangeEditor-1'),
  height: propTypes.oneOfType([Number, String]).def('500px'),
  editorConfig: {
    type: Object as PropType<IEditorConfig>,
    default: () => undefined
  },
  modelValue: propTypes.string.def('')
})

const emit = defineEmits(['change', 'update:modelValue'])

// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef<IDomEditor>()

const valueHtml = ref('')

watch(
  () => props.modelValue,
  (val: string) => {
    if (val === unref(valueHtml)) return
    valueHtml.value = val
  }
)

// 监听
watch(
  () => valueHtml.value,
  (val: string) => {
    emit('update:modelValue', val)
  }
)

const handleCreated = (editor: IDomEditor) => {
  editorRef.value = editor
  valueHtml.value = props.modelValue
}

// 编辑器配置
const editorConfig = computed((): IEditorConfig => {
  return Object.assign(
    {
      readOnly: false,
      customAlert: (s: string, t: string) => {
        switch (t) {
          case 'success':
            ElMessage.success(s)
            break
          case 'info':
            ElMessage.info(s)
            break
          case 'warning':
            ElMessage.warning(s)
            break
          case 'error':
            ElMessage.error(s)
            break
          default:
            ElMessage.info(s)
            break
        }
      },
      autoFocus: false,
      scroll: true,
      uploadImgShowBase64: true,
      MENU_CONF: {
        uploadImage: {
          async customUpload(
            file: File,
            insertFn: (url: string, alt: string, href: string) => void
          ) {
            const loading = ElLoading.service({
              lock: true,
              text: '上传中...',
              background: 'rgba(0, 0, 0, 0.7)'
            })
            try {
              const url = await uploadFile(file)
              if (url) insertFn(url, '图片加载错误', url)
            } catch (error) {
              ElMessage.error('上传失败')
            } finally {
              loading.close()
            }
          }
        },
        uploadVideo: {
          async customUpload(file: File, insertFn: (url: string, poster: string) => void) {
            const loading = ElLoading.service({
              lock: true,
              text: '上传中...',
              background: 'rgba(0, 0, 0, 0.7)'
            })
            try {
              const url = await uploadFile(file)

              if (url) insertFn(url, '')
            } catch (error) {
              ElMessage.error('上传失败')
            } finally {
              loading.close()
            }
          }
        }
      }
    },
    props.editorConfig || {}
  )
})

const editorStyle = computed(() => {
  return {
    height: isNumber(props.height) ? `${props.height}px` : props.height
  }
})

// 回调函数
const handleChange = (editor: IDomEditor) => {
  emit('change', editor)
}

// 组件销毁时，及时销毁编辑器
onBeforeUnmount(() => {
  const editor = unref(editorRef.value)

  // 销毁，并移除 editor
  editor?.destroy()
})

const getEditorRef = async (): Promise<IDomEditor> => {
  await nextTick()
  return unref(editorRef.value) as IDomEditor
}

defineExpose({
  getEditorRef
})
</script>

<template>
  <div class="border-1 border-solid border-[var(--el-border-color)] z-10">
    <!-- 工具栏 -->
    <Toolbar
      :editor="editorRef"
      :editorId="editorId"
      class="border-0 b-b-1 border-solid border-[var(--el-border-color)]"
    />
    <!-- 编辑器 -->
    <Editor
      class="custom-class"
      v-model="valueHtml"
      :editorId="editorId"
      :defaultConfig="editorConfig"
      :style="editorStyle"
      @on-change="handleChange"
      @on-created="handleCreated"
    />
  </div>
</template>

<style src="@wangeditor/editor/dist/css/style.css"></style>

<style lang="less" scoped>
.custom-class {
  :deep(.w-e-textarea-video-container) {
    background-image: none !important;
    border: none;
  }
}
</style>
