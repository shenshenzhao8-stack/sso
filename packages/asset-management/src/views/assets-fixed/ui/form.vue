<script lang="tsx" setup>
import { reactive, ref, watch, onMounted } from 'vue'
import { ElMessage, ElButton, type UploadRequestOptions, ElImage, ElLoading } from 'element-plus'
import type { FormSchema } from '@/components/Form'
import { Form } from '@/components/Form'
import { useForm } from '@/hooks/web/useForm'
import { useValidator } from '@/hooks/web/useValidator'
import { uploadFile } from '@/api/common/index'
import { dataConfigurationDictionaryList } from '@/api/configuration-dictionary'
import { isArray, find } from 'lodash-es'
import { ASSETS_STATUS } from '@/const'

const { formMethods, formRegister } = useForm()
const { required, lengthRange, _decimalPlaces } = useValidator()

const { disabled, data } = defineProps({
  disabled: {
    type: Boolean,
    default: false
  },
  data: {
    type: Object,
    default: () => {}
  }
})

const uploadLoading = ref(false)
const imageUrl = ref(''),
  img_id = ref(),
  selectConfigurationDictionary = ref<any>([])

const httpRequest = async (params: UploadRequestOptions): Promise<{ url: string }> => {
  const { file } = params
  const loading = ElLoading.service({
    lock: true,
    text: 'Loading',
    background: 'rgba(255, 255, 255, 0.7)'
  })

  return new Promise<{ url: string }>(async (resolve, reject) => {
    uploadLoading.value = true
    const res = await uploadFile(file)
    uploadLoading.value = false
    loading.close()
    if (res) {
      imageUrl.value = res?.url
      img_id.value = res?.id
    }
  })
}

const schema = reactive<FormSchema[]>([
  {
    field: 'id',
    label: '物品 ID',
    component: 'Input',
    componentProps: {
      disabled: true
    }
  },
  {
    field: 'status',
    label: '状态',
    component: 'Select',
    componentProps: {
      disabled: true,
      options: ASSETS_STATUS
    }
  },
  {
    field: 'name',
    label: '物品名称',
    component: 'Input',
    formItemProps: {
      rules: [required(), lengthRange({ min: 1, max: 30, message: '物品名称长度在30字符以内' })]
    }
  },
  {
    field: 'goods_type',
    label: '物品类型',
    component: 'Select',
    formItemProps: {
      rules: [required()]
    },
    componentProps: {
      options: selectConfigurationDictionary
    }
  },
  {
    field: 'price',
    label: '单价',
    component: 'Input',
    componentProps: {
      slots: {
        suffix: () => '元'
      },
      type: 'number'
    },
    formItemProps: {
      rules: [required(), _decimalPlaces()]
    }
  },
  {
    field: 'unit',
    label: '单位',
    component: 'Input',
    formItemProps: {
      rules: [required(), lengthRange({ min: 1, max: 5, message: '单位长度在5字符以内' })]
    }
  },
  {
    field: 'brand',
    label: '品牌/规格',
    component: 'Input',
    formItemProps: {
      rules: [required(), lengthRange({ min: 1, max: 100, message: '品牌/规格长度在100字符以内' })]
    },
    colProps: {
      span: 24
    }
  },
  {
    field: 'upload',
    label: '物品图片',
    component: 'Upload',
    formItemProps: {
      rules: [required()]
    },
    componentProps: {
      action: '#',
      httpRequest,
      accept: 'image/*',
      showFileList: false,
      beforeUpload: (rawFile: File) => {
        if (rawFile.type === 'image/gif') {
          ElMessage.error('上传的文件格式不正确')
          return false
        } else if (rawFile.size / 1024 / 1024 > 5) {
          ElMessage.error('物品图片大小不能超过5M')
          return false
        }
        return true
      },
      slots: {
        default: () => (
          <div class="flex">
            {imageUrl.value ? (
              <ElImage
                class="h-[100px] mr-10px"
                fit="cover"
                lazy
                preview-teleported
                preview-src-list={[imageUrl.value]}
                src={imageUrl.value}
              />
            ) : null}
            {!disabled ? (
              <ElButton class="self-end" type="primary">
                点击上传
              </ElButton>
            ) : null}
          </div>
        ),
        tip: () => <div>支持jpg、png格式图片大小不超过5MB</div>
      }
    },
    colProps: {
      span: 24
    }
  }
])

const { setValues, getFormData, getElFormExpose, setProps, setSchema } = formMethods

watch(
  () => data,
  async (currentRow) => {
    if (!currentRow && !getElFormExpose()) return
    imageUrl.value = currentRow?.img_url
    img_id.value = currentRow?.img_id
    setValues({
      ...currentRow,
      goods_type: currentRow.type,
      upload: [
        {
          name: currentRow.img_id,
          url: currentRow.img_url
        }
      ]
    })

    const arr = await getGoodsType()

    const findObj = find(arr, { value: currentRow.type })

    if (!findObj) {
      selectConfigurationDictionary.value.push({
        label: currentRow.type_name,
        value: currentRow.type,
        disabled: true
      })
    }
  },
  {
    deep: true
  }
)

watch(
  () => disabled,
  (val) => {
    setProps({
      disabled: val
    })
  },
  {
    deep: true,
    immediate: true
  }
)

onMounted(() => {
  if (data) return
  getGoodsType()
})

const getGoodsType = async () => {
  const res = await dataConfigurationDictionaryList({ category: 1 })
  if (res.code === 200) {
    const arr = isArray(res.data)
      ? res.data.map((v: any) => ({
          label: v.type,
          value: v.id
        }))
      : []
    selectConfigurationDictionary.value = arr

    return arr
  }

  return []
}

const handleClick = async () => {
  const elForm = await getElFormExpose()
  const valid = await elForm?.validate().catch((err) => {
    console.log(err)
  })
  if (valid) {
    if (!img_id.value) {
      ElMessage.error('请上传物品图片')
      return
    }

    const formData = await getFormData()

    delete formData.upload

    return {
      ...formData,
      img_id: img_id.value,
      price: Number(formData.price)
    }
  }
}

defineExpose({
  submit: handleClick
})
</script>
<template>
  <Form @register="formRegister" :schema="schema" />
</template>
