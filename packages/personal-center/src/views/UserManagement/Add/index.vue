<script setup lang="tsx">
import { reactive, ref, onMounted } from 'vue'
import { ContentWrap } from '@/components/ContentWrap'
import { type FormRules, ElMessageBox, ElMessage } from 'element-plus'
import { Form, type FormSchema } from '@/components/Form'
import { useForm } from '@/hooks/web/useForm'
import { useValidator } from '@/hooks/web/useValidator'
import { BaseButton } from '@/components/Button'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import { getUserInfoApi, insertUserApi, userUpdateApi } from '@/api/user/index'
import type { UserInfoType } from '@/api/common/types'
import { getDepartmentLevelListApi } from '@/api/department/index'
import { getDictListApi } from '@/api/dictionary/index'

let isLeave: boolean = false

const { fullPath, query } = useRoute()
const { go } = useRouter()

const { formRegister, formMethods } = useForm()
const { getElFormExpose, getFormData, setValues, setSchema } = formMethods
const { required, lengthRange } = useValidator()

const rules: FormRules = {
  email: [
    required('请输入邮箱'),
    lengthRange({ min: 1, max: 30, message: '邮箱长度在30个字符以内' })
  ],
  number: [
    required('请输入工号'),
    lengthRange({ min: 1, max: 20, message: '工号长度在20个字符以内' })
  ],
  name: [
    required('请输入姓名'),
    lengthRange({ min: 1, max: 20, message: '姓名长度在20个字符以内' })
  ],
  sex: [required('请选择性别')],
  position: [
    required('请输入岗位'),
    lengthRange({ min: 1, max: 30, message: '岗位长度在30个字符以内' })
  ],
  // department_id: [required('请选择部门')],
  project_id: [required('请选择所在项目')],
  contract_id: [required('请选择合同归属')],
  status: [required('请选择状态')],
  remark: [lengthRange({ min: 0, max: 200, message: '备注长度在200个字符以内' })]
}

const getProjectList = async (query: string) => {
  const res = await getDictListApi({ page: 1, limit: 20, type: 2, name: query })
  const list =
    res.data.result?.map((item) => ({
      label: item.name,
      value: item.id
    })) ?? []
  setSchema([
    {
      field: 'project_id',
      path: 'componentProps.options',
      value: list
    }
  ])
}

const getContractList = async (query: string) => {
  const res = await getDictListApi({ page: 1, limit: 20, type: 1, name: query })
  const list =
    res.data.result?.map((item) => ({
      label: item.name,
      value: item.id
    })) ?? []
  setSchema([
    {
      field: 'contract_id',
      path: 'componentProps.options',
      value: list
    }
  ])
}

const schema = reactive<FormSchema[]>([
  {
    field: 'email',
    label: '邮箱',
    component: 'Input',
    componentProps: {
      placeholder: '请输入邮箱'
    }
  },
  {
    field: 'number',
    label: '工号',
    component: 'Input',
    componentProps: {
      placeholder: '请输入工号'
    }
  },
  {
    field: 'name',
    label: '姓名',
    component: 'Input',
    componentProps: {
      placeholder: '请输入姓名'
    }
  },
  {
    field: 'sex',
    label: '性别',
    component: 'Select',
    componentProps: {
      placeholder: '请选择性别',
      options: [
        {
          label: '男',
          value: 1
        },
        {
          label: '女',
          value: 2
        }
      ]
    }
  },
  {
    field: 'position',
    label: '岗位',
    component: 'Input',
    componentProps: {
      placeholder: '请输入岗位'
    }
  },
  {
    field: 'department_id',
    label: '部门',
    component: 'Cascader',
    componentProps: {
      props: {
        label: 'name',
        value: 'id',
        checkStrictly: true
      }
    }
  },
  {
    field: 'project_id',
    label: '所在项目',
    component: 'Select',
    componentProps: {
      placeholder: '请选择所在项目',
      filterable: true,
      remote: true,
      remoteShowSuffix: true,
      remoteMethod: getProjectList
    }
  },
  {
    field: 'contract_id',
    label: '合同归属',
    component: 'Select',
    componentProps: {
      placeholder: '请选择合同归属',
      filterable: true,
      remote: true,
      remoteShowSuffix: true,
      remoteMethod: getContractList
    }
  },
  {
    field: 'status',
    label: '状态',
    colProps: {
      span: 24
    },
    value: 1,
    component: 'RadioGroup',
    componentProps: {
      options: [
        {
          label: '在职',
          value: 1
        },
        {
          label: '离职',
          value: 2
        },
        {
          label: '离项中',
          value: 3
        },
        {
          label: '待岗中',
          value: 4
        }
      ]
    }
  },
  {
    field: 'remark',
    label: '备注',
    colProps: {
      span: 24
    },
    component: 'Input',
    componentProps: {
      placeholder: '请输入备注',
      type: 'textarea',
      autosize: {
        minRows: 5,
        maxRows: 10
      }
    }
  }
])

const isAdd = ref(true)
const user_info_detail = ref<UserInfoType>()

onMounted(async () => {
  isAdd.value = fullPath.includes('add')
  await getDepartmentLevelList()
  if (!isAdd.value) {
    await getUserInfoDetail(Number(query.id))
  }
})

const getDepartmentLevelList = async () => {
  const res = await getDepartmentLevelListApi()
  if (res.code === 200) {
    const departments = res.data?.result ?? []
    appendHeadName(departments)
    setSchema([
      {
        field: 'department_id',
        path: 'componentProps.options',
        value: departments
      }
    ])
  }
}

const appendHeadName = (departments: any[]) => {
  departments.forEach((department) => {
    if (department.head_user_info && department.head_user_info.name) {
      department.name += ` (${department.head_user_info.name})`
    }
    if (department.children) {
      appendHeadName(department.children)
    }
  })
}

const getUserInfoDetail = async (id: number) => {
  const res = await getUserInfoApi({ user_id: id })
  if (res.code === 200) {
    user_info_detail.value = res.data
    setSchema([
      {
        field: 'email',
        path: 'componentProps.disabled',
        value: true
      },
      // {
      //   field: 'number',
      //   path: 'componentProps.disabled',
      //   value: true
      // },
      // {
      //   field: 'name',
      //   path: 'componentProps.disabled',
      //   value: true
      // },
      {
        field: 'project_id',
        path: 'componentProps.options',
        value: [
          {
            value: res.data.project_info?.id ?? 0,
            label: res.data.project_info?.name ?? ''
          }
        ]
      },
      {
        field: 'contract_id',
        path: 'componentProps.options',
        value: [
          {
            value: res.data.contract_info?.id ?? 0,
            label: res.data.contract_info?.name ?? ''
          }
        ]
      }
    ])
    setValues({
      email: res.data.email,
      number: res.data.number,
      name: res.data.name,
      sex: res.data.sex,
      position: res.data.position,
      department_id: res.data.department_info?.id,
      project_id: res.data.project_info?.id,
      contract_id: res.data.contract_info?.id,
      status: res.data.status,
      remark: res.data.remark
    })
  }
}

const submitAction = async () => {
  const formRef = await getElFormExpose()
  await formRef?.validate(async (isValid) => {
    if (isValid) {
      const formData = await getFormData<any>()
      if (!/^[a-zA-Z0-9_.+-]+@yidatec\.com$/.test(formData.email)) {
        ElMessage.error('邮箱格式不正确，请检查您的邮箱')
        return
      }
      if (isAdd.value) {
        const res = await insertUserApi({
          users: [
            {
              ...formData,
              department_id: formData.department_id
                ? formData.department_id[formData.department_id.length - 1]
                : undefined
            }
          ]
        })
        if (res.code === 200) {
          ElMessage.success('保存成功')
          isLeave = true
          go(-1)
        } else {
          ElMessage.error('保存失败')
        }
      } else {
        if (!user_info_detail.value?.id) return
        const res = await userUpdateApi({
          ...formData,
          department_id: formData.department_id
            ? formData.department_id[formData.department_id.length - 1]
            : undefined,
          id: user_info_detail.value.id
        })
        if (res.code === 200) {
          ElMessage.success('更新成功')
          isLeave = true
          go(-1)
        } else {
          ElMessage.error('更新失败')
        }
      }
    }
  })
}

const cancelAction = () => {
  go(-1)
}

onBeforeRouteLeave((to, from, next) => {
  if (isLeave) {
    next()
    return
  }
  ElMessageBox.confirm('用户信息还未保存，是否取消？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    next()
  })
})
</script>

<template>
  <ContentWrap class="min-h-[var(--view-context-height)] pl-150px pr-150px">
    <BaseButton class="pos-absolute left-40px top-40px" @click="go(-1)"> 返回 </BaseButton>
    <div class="min-h-[calc(var(--view-context-height)-94px)]">
      <div class="text-align-center font-bold">
        {{ isAdd ? '新增用户' : '编辑用户' }}
      </div>
      <div class="ml-10px mt-30px mb-30px">用户信息</div>
      <Form :schema="schema" :rules="rules" @register="formRegister" />
    </div>
    <div class="h-[52px] pt-20px border-t-1px border-t-solid border-t-[#409eff]">
      <BaseButton type="primary" @click="submitAction">提交</BaseButton>
      <BaseButton @click="cancelAction">取消</BaseButton>
    </div>
  </ContentWrap>
</template>

<style lang="less" scoped>
:deep(.el-col) {
  margin-bottom: 10px;
}
</style>
