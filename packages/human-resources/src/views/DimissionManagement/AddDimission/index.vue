<script setup lang="tsx">
import { reactive, ref, onMounted } from 'vue'
import { ContentWrap } from '@/components/ContentWrap'
import { type FormRules, ElMessageBox, ElMessage } from 'element-plus'
import { Form, type FormSchema } from '@/components/Form'
import { useForm } from '@/hooks/web/useForm'
import { useValidator } from '@/hooks/web/useValidator'
import { BaseButton } from '@/components/Button'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import EmailCard from '@/views/DimissionManagement/AddDimission/components/EmailCard.vue'
import {
  getDictListApi,
  getContractListApi,
  getUserListApi,
  createResignationApi,
  getResignationInfoApi,
  updateResignationInfoApi,
  getRelatedEmailGroupApi,
  deleteResignationApi
} from '@/api/dimission/index'
import type {
  DictItemType,
  DictExtraItemType,
  EmailGroupItemType,
  UserInfoType
} from '@/api/dimission/types'

let isLeave: boolean = false

const { fullPath, query } = useRoute()
const { go, push, replace } = useRouter()

const { formRegister, formMethods } = useForm()
const { getElFormExpose, getFormData, setValues, setSchema } = formMethods
const { required, lengthRange } = useValidator()

const requestEmployee = async (query: string) => {
  const res = await getUserListApi({ name: query, user_type: 1 })
  const userList =
    res.data.result?.map((item: UserInfoType) => ({
      label: item.name,
      value: item.id
    })) ?? []
  setSchema([
    {
      field: 'user_id',
      path: 'componentProps.options',
      value: userList
    }
  ])
}

const requestApprover = async (query: string) => {
  const res = await getUserListApi({ name: query, user_type: 2 })
  const userList =
    res.data.result?.map((item: UserInfoType) => ({
      label: item.name,
      value: item.id
    })) ?? []
  setSchema([
    {
      field: 'approver_ids',
      path: 'componentProps.options',
      value: userList
    }
  ])
}

const rules: FormRules = {
  user_id: [required('请输入员工')],
  approver_ids: [required('请输入审批人')],
  user_type_id: [required('请选择员工类型')],
  type_id: [required('请选择离职类型')],
  sub_type_id: [required('请选择离职类别')],
  liquidated_damages_type: [required('请选择是否有违约金')],
  compensation_type: [required('请选择赔偿金类型')],
  last_working_date_time: [required('请输入最后工作日期')],
  processing_date_time: [required('请输入离职手续办理日期')],
  contract_belongs_to_id: [required('请选择合同归属')],
  total_paid_leave: [required('请输入当年可休小时数（带薪假）')],
  remaining_paid_leave: [required('请输入可休剩余小时数（带薪假）')],
  adjusted_leave: [required('请输入串休剩余小时数')],
  reason: [
    required('请输入离职原因'),
    lengthRange({ min: 1, max: 200, message: '离职原因不能超过200个字' })
  ],
  remark: [lengthRange({ min: 1, max: 200, message: '备注不能超过200个字' })]
}

const schema = reactive<FormSchema[]>([
  {
    field: 'user_id',
    label: '离职员工',
    component: 'Select',
    componentProps: {
      placeholder: '请输入要离职的员工',
      filterable: true,
      remote: true,
      remoteShowSuffix: true,
      remoteMethod: requestEmployee,
      on: {
        change: (value: number) => {
          resignationUserChange(value)
        }
      }
    }
  },
  {
    field: 'approver_ids',
    label: '审批人',
    component: 'Select',
    componentProps: {
      placeholder: '请输入审批人',
      filterable: true,
      remote: true,
      remoteShowSuffix: true,
      multiple: true,
      remoteMethod: requestApprover
    }
  },
  {
    field: 'user_type_id',
    label: '员工类型',
    colProps: {
      span: 24
    },
    component: 'RadioGroup'
  },
  {
    field: 'type_id',
    label: '离职类型',
    component: 'RadioGroup',
    componentProps: {
      on: {
        change: (value: number) => {
          resignationTypeChange(value)
        }
      }
    }
  },
  {
    field: 'sub_type_id',
    label: '离职类别',
    component: 'Select'
  },
  {
    field: 'liquidated_damages_type',
    label: '违约金',
    component: 'RadioGroup',
    componentProps: {
      options: [
        {
          label: '无',
          value: 1
        },
        {
          label: '有',
          value: 2
        }
      ]
    }
  },
  {
    field: 'compensation_type',
    label: '赔偿金',
    component: 'RadioGroup',
    componentProps: {
      options: [
        {
          label: '无',
          value: 1
        },
        {
          label: '有（标准）',
          value: 2
        },
        {
          label: '有（其他）',
          value: 3
        }
      ]
    }
  },
  {
    field: 'last_working_date_time',
    label: '最后工作日期',
    component: 'DatePicker',
    componentProps: {
      type: 'datetime'
    }
  },
  {
    field: 'processing_date_time',
    label: '离职手续办理日期',
    component: 'DatePicker',
    componentProps: {
      type: 'datetime'
    }
  },
  {
    field: 'contract_belongs_to_id',
    label: '合同归属',
    component: 'Select'
  },
  {
    field: 'total_paid_leave',
    label: '当年可休小时数（带薪假）',
    component: 'InputNumber',
    componentProps: {
      precision: 2,
      step: 1,
      min: 0,
      max: 10000
    }
  },
  {
    field: 'remaining_paid_leave',
    label: '可休剩余小时数（带薪假）',
    component: 'InputNumber',
    componentProps: {
      precision: 2,
      step: 1,
      min: 0,
      max: 10000
    }
  },
  {
    field: 'adjusted_leave',
    label: '串休剩余小时数',
    component: 'InputNumber',
    componentProps: {
      precision: 2,
      step: 1,
      min: 0,
      max: 10000
    }
  },
  {
    field: 'reason',
    label: '离职原因',
    component: 'Input'
  },
  {
    field: 'remark',
    label: '备注',
    component: 'Input'
  }
])

const isAdd = ref(true)
const isDetail = ref(false)
const uploadLoading = ref(false)
const resignationTypeAry = ref<DictItemType[]>([])
const emailGroups = ref<{ tag: number; info?: EmailGroupItemType }[]>([])
const emailCardRefs = ref<{ tag: number; component: InstanceType<typeof EmailCard> }[]>([])

onMounted(async () => {
  isAdd.value = fullPath.includes('add')
  isDetail.value = fullPath.includes('detail')
  await getDictList()
  await getUserTypeDictList()
  await getContractBelongsDictList()
  if (!isAdd.value) {
    await getDimissionDetail(Number(query.id))
  } else {
    setDeaultEmailInfo()
  }
})

const resignationUserChange = async (id: number) => {
  const res = await getRelatedEmailGroupApi({ id })
  if (res.code === 200) {
    emailGroups.value = [
      {
        tag: new Date().getTime()
      }
    ]
    if (!res.data.users) return
    emailGroups.value = res.data.users.map((item: UserInfoType, index: number) => {
      const emailGroup = {
        user_id: item.id,
        send_type: 1,
        user_info: item
      }
      return {
        tag: new Date().getTime() + index,
        info: emailGroup
      }
    })
  }
}

const resignationTypeChange = (id: number) => {
  const subType = resignationTypeAry.value.find((item: DictItemType) => item.id === id)?.extra || []
  setValues({
    sub_type_id: undefined
  })
  setSchema([
    {
      field: 'sub_type_id',
      path: 'componentProps.options',
      value: subType.map((item: DictExtraItemType) => {
        return {
          label: item.name,
          value: item.id
        }
      })
    }
  ])
}

const setDeaultEmailInfo = () => {
  emailGroups.value = [
    {
      tag: new Date().getTime()
    }
  ]
}

const getDimissionDetail = async (id: number) => {
  const res = await getResignationInfoApi({ id })
  if (res.code === 200) {
    resignationTypeChange(res.data.type_id)
    setSchema([
      {
        field: 'user_id',
        path: 'componentProps.options',
        value: [
          {
            label: res.data.user_info.name,
            value: res.data.user_id
          }
        ]
      },
      {
        field: 'user_id',
        path: 'componentProps.disabled',
        value: true
      },
      {
        field: 'approver_ids',
        path: 'componentProps.options',
        value:
          res.data.approver_info?.map((item: UserInfoType) => ({
            label: item.name,
            value: item.id
          })) ?? []
      }
    ])
    setValues({
      user_id: res.data.user_id,
      approver_ids: res.data.approver_ids,
      user_type_id: res.data.user_type_id,
      type_id: res.data.type_id,
      sub_type_id: res.data.sub_type_id,
      liquidated_damages_type: res.data.liquidated_damages_type,
      compensation_type: res.data.compensation_type,
      last_working_date_time: new Date(res.data.last_working_date_time),
      processing_date_time: new Date(res.data.processing_date_time),
      contract_belongs_to_id: res.data.contract_belongs_to_id,
      total_paid_leave: +res.data.total_paid_leave,
      remaining_paid_leave: +res.data.remaining_paid_leave,
      adjusted_leave: +res.data.adjusted_leave,
      reason: res.data.reason,
      remark: res.data.remark
    })
    if (res.data.email_group) {
      emailGroups.value = res.data.email_group.map((item: EmailGroupItemType, index: number) => ({
        tag: new Date().getTime() + index,
        info: item
      }))
    }
  }
}

const addReceiverEmail = (tag: number) => {
  const index = emailCardRefs.value.findIndex((v) => v.tag === tag)
  emailGroups.value.splice(index + 1, 0, {
    tag: new Date().getTime()
  })
}

const deleteReceiverEmail = (tag: number) => {
  if (emailGroups.value.length === 1) {
    ElMessage.error('至少需要一个收件人')
    return
  }
  ElMessageBox.confirm('确定删除该条邮件信息？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    emailCardRefs.value = []
    emailGroups.value = emailGroups.value.filter((item) => item.tag !== tag)
  })
}

const submitAction = async () => {
  let base_info: any = {}
  const email_group: any[] = []
  let baseIsVaild = false
  const formRef = await getElFormExpose()
  await formRef?.validate(async (isValid) => {
    baseIsVaild = isValid
    if (isValid) {
      const formData = await getFormData<any>()
      base_info = formData
    }
  })
  for (let index = 0; index < emailCardRefs.value.length; index++) {
    const emailCard = emailCardRefs.value[index]
    const emailData = await emailCard.component.submitAction()
    if (emailData) {
      email_group.push({
        user_id: emailData.user_id,
        send_type: emailData.send_type
      })
    }
  }
  if (!baseIsVaild || email_group.length !== emailCardRefs.value.length) return

  const boxData = await ElMessageBox.confirm(
    '确定提交该条离职信息，并发送邮件给指定的收件人与抄送人？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
  if (boxData !== 'confirm') return

  const allFormData = {
    ...base_info,
    last_working_date_time: base_info.last_working_date_time?.toISOString(),
    processing_date_time: base_info.processing_date_time?.toISOString(),
    total_paid_leave: `${base_info.total_paid_leave ?? 0}`,
    remaining_paid_leave: `${base_info.remaining_paid_leave ?? 0}`,
    adjusted_leave: `${base_info.adjusted_leave ?? 0}`,
    email_group
  }
  const res = isAdd.value
    ? await createResignationApi(allFormData)
    : await updateResignationInfoApi({
        ...allFormData,
        id: Number(query.id)
      })
  if (res.code === 200) {
    ElMessage.success('保存成功')
    isLeave = true
    replace('/dimission-management/list')
  } else {
    ElMessage.error('保存失败')
  }
}

const reEditAction = () => {
  push({
    path: '/dimission-management/edit',
    query: {
      id: query.id
    }
  })
}

const cancelAction = () => {
  go(-1)
}

const deleteAction = async () => {
  ElMessageBox.confirm('确定删除该条离职信息', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const res = await deleteResignationApi({ id: Number(query.id) })
    if (res.code === 200) {
      ElMessage.success('删除成功')
      go(-1)
    }
  })
}

onBeforeRouteLeave((to, from, next) => {
  if (isDetail.value || isLeave) {
    next()
    return
  }
  ElMessageBox.confirm('离职信息还未保存，是否取消？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    next()
  })
})

const setEmailCardRef = (el: any, tag: number, index: number) => {
  if (el) {
    emailCardRefs.value[index] = {
      tag,
      component: el
    }
  }
}

const getDictList = async () => {
  const res = await getDictListApi({ type: 2 })
  resignationTypeAry.value = res.data.result ?? []
  setSchema([
    {
      field: 'type_id',
      path: 'componentProps.options',
      value: resignationTypeAry.value.map((item: DictItemType) => {
        return {
          label: item.name,
          value: item.id
        }
      })
    }
  ])
}

const getUserTypeDictList = async () => {
  const res = await getDictListApi({ type: 1 })
  setSchema([
    {
      field: 'user_type_id',
      path: 'componentProps.options',
      value:
        res.data?.result?.map((item: DictItemType) => {
          return {
            label: item.name,
            value: item.id
          }
        }) ?? []
    }
  ])
}

const getContractBelongsDictList = async () => {
  const res = await getContractListApi()
  setSchema([
    {
      field: 'contract_belongs_to_id',
      path: 'componentProps.options',
      value:
        res.data?.result?.map((item: DictItemType) => {
          return {
            label: item.name,
            value: item.id
          }
        }) ?? []
    }
  ])
}
</script>

<template>
  <ContentWrap
    class="min-h-[var(--view-context-height)] pl-150px pr-150px"
    v-loading="uploadLoading"
  >
    <BaseButton class="pos-absolute left-40px top-40px" @click="go(-1)"> 返回 </BaseButton>
    <div class="min-h-[calc(var(--view-context-height)-94px)]">
      <div class="text-align-center font-bold">
        {{ isAdd ? '新增' : isDetail ? '详细' : '编辑' }}
      </div>
      <div class="ml-10px mt-30px mb-30px">提交离职申请</div>
      <Form :schema="schema" :rules="rules" @register="formRegister" :disabled="isDetail" />
      <div class="mt-20px"><span class="text-red"> * </span>邮件组</div>
      <EmailCard
        class="mt-10px"
        v-for="(item, index) in emailGroups"
        :ref="(el) => setEmailCardRef(el, item.tag, index)"
        :key="item.tag"
        :tag="item.tag"
        :email-group="item.info"
        :disabled="isDetail"
        @add-receiver-email="addReceiverEmail"
        @delete-receiver-email="deleteReceiverEmail"
      />
    </div>
    <div class="mt-30px h-[52px] pt-20px border-t-1px border-t-solid border-t-[#409eff]">
      <BaseButton v-if="!isDetail" type="primary" @click="submitAction">提交并发送邮件</BaseButton>
      <BaseButton v-else type="primary" @click="reEditAction">编辑</BaseButton>
      <BaseButton v-if="!isDetail" @click="cancelAction">取消</BaseButton>
      <BaseButton v-else type="danger" @click="deleteAction">删除</BaseButton>
    </div>
  </ContentWrap>
</template>
