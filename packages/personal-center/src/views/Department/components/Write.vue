<script setup lang="tsx">
import { type PropType, reactive, watch, onMounted } from 'vue'
import { Form, type FormSchema } from '@/components/Form'
import { useForm } from '@/hooks/web/useForm'
import { useValidator } from '@/hooks/web/useValidator'
import { cloneDeep } from 'lodash-es'
import { getDepartmentLevelListApi, getUserListApi } from '@/api/department'
import type { UserInfoType } from '@/api/common/types'

const { required, lengthRange, notSpace } = useValidator()

const props = defineProps({
  currentRow: {
    type: Object as PropType<any>,
    default: () => null
  }
})

const rules = reactive({
  name: [
    required('请输入部门名称'),
    lengthRange({ min: 1, max: 20, message: '部门名称长度在20字符以内' }),
    notSpace()
  ],
  head_user: [required('请选择部门领导')],
  level: [required('请选择职级')]
})

const requestLeader = async (query: string) => {
  const res = await getUserListApi({ name: query, user_type: 1 })
  const userList =
    res.data.result?.map((item: UserInfoType) => ({
      label: item.name,
      value: item.id
    })) ?? []
  setSchema([
    {
      field: 'head_user',
      path: 'componentProps.options',
      value: userList
    }
  ])
}

const formSchema = reactive<FormSchema[]>([
  {
    field: 'name',
    label: '部门名称',
    component: 'Input',
    componentProps: {
      placeholder: '请输入部门名称'
    }
  },
  {
    field: 'head_user',
    label: '部门领导',
    component: 'Select',
    componentProps: {
      placeholder: '请输入部门领导',
      filterable: true,
      remote: true,
      remoteShowSuffix: true,
      remoteMethod: requestLeader
    }
  },
  {
    field: 'level',
    label: '职级',
    component: 'Select',
    componentProps: {
      placeholder: '请选择职级',
      options: [
        {
          label: 'L1',
          value: 1
        },
        {
          label: 'L2',
          value: 2
        },
        {
          label: 'L3',
          value: 3
        },
        {
          label: 'L4',
          value: 4
        },
        {
          label: 'L5',
          value: 5
        }
      ]
    }
  },
  {
    field: 'parent_department_id',
    label: '上级部门',
    component: 'TreeSelect',
    componentProps: {
      nodeKey: 'id',
      props: {
        label: 'name'
      },
      checkStrictly: true
    }
  }
])

const { formRegister, formMethods } = useForm()
const { setValues, getFormData, getElFormExpose, setSchema } = formMethods

const submit = async () => {
  const elForm = await getElFormExpose()
  const valid = await elForm?.validate().catch((err) => {
    console.log(err)
  })
  if (valid) {
    const formData = await getFormData()
    return formData
  }
}

watch(
  () => props.currentRow,
  (value) => {
    if (!value) return
    const currentRow = cloneDeep(value)
    setSchema([
      {
        field: 'head_user',
        path: 'componentProps.options',
        value: [
          {
            label: currentRow.head_user_info.name,
            value: currentRow.head_user_info.id
          }
        ]
      }
    ])
    setValues({
      name: currentRow.name,
      head_user: currentRow.head_user,
      level: currentRow.level,
      parent_department_id: currentRow.parent_department_id || undefined
    })
  },
  {
    deep: true,
    immediate: true
  }
)

onMounted(() => {
  getDepartmentLevelList()
})

const getDepartmentLevelList = async () => {
  const res = await getDepartmentLevelListApi()
  if (res.code === 200) {
    setSchema([
      {
        field: 'parent_department_id',
        path: 'componentProps.data',
        value: res.data?.result ?? []
      }
    ])
  }
}

defineExpose({
  submit
})
</script>

<template>
  <Form :rules="rules" @register="formRegister" :schema="formSchema" />
</template>
