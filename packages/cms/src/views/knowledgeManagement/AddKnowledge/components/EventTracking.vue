<template>
  <div class="event-tracking">
    <LookFileDialog
      v-model:model-value="show"
      :file-list="fileList"
      ref="lookFileDialogRef"
      @submit="lookFileSubmit"
      :disabled="disabled"
    />
    <ElDivider content-position="left"> 事件跟踪处理 </ElDivider>

    <div class="flex flex-col">
      <div class="flex w-100%" v-for="(item, index) in process_schedule_list" :key="item.id">
        <el-card shadow="never" class="mb-20px">
          <el-form
            ref="formRefs"
            :model="item"
            :disabled="disabled"
            label-width="auto"
            :rules="rules"
          >
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="序号">
                  <div>{{ index + 1 }}</div>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="处理人" prop="processor_id">
                  <el-select
                    v-model="item.processor_id"
                    placeholder="处理人"
                    :multiple="true"
                    :filterable="true"
                    :clearable="true"
                  >
                    <el-option
                      v-for="item in userList"
                      :key="item.id"
                      :label="item.name"
                      :value="item.id"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="上传附件">
                  <el-upload
                    ref="uploadRefs"
                    class="upload-demo"
                    action="#"
                    :multiple="true"
                    :showFileList="false"
                    :http-request="httpRequest"
                  >
                    <div class="flex items-center" @click.stop="(e) => e.preventDefault()">
                      <div
                        class="m-r10px"
                        @click="lookFile(index)"
                        v-if="item.attachment_file_list?.length"
                      >
                        <div class="el-button el-button--success" :disabled="false">预览附件</div>
                      </div>
                      <div @click="selectFile(index)">
                        <BaseButton type="primary"> 点击上传</BaseButton>
                      </div>
                    </div>
                    <template #tip>
                      <div class="el-upload__tip">
                        只支持图片附件上传，最多可上传9张，每张大小不超过10mb
                      </div>
                    </template>
                  </el-upload>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="处理时间" prop="process_at">
                  <el-date-picker
                    class="w-100%"
                    v-model="item.process_at"
                    type="datetime"
                    placeholder="处理时间"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="处理状态" prop="process_state">
                  <el-radio-group v-model="item.process_state">
                    <el-radio :value="1">同意</el-radio>
                    <el-radio :value="2">不同意</el-radio>
                    <el-radio :value="3">事件结束</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="处理意见" prop="process_content">
                  <el-input v-model="item.process_content" maxlength="100" placeholder="处理意见" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-card>
        <div class="flex flex-col justify-center m-l20px items-center">
          <BaseButton class="m-0" type="primary" @click="add(index)" :disabled="disabled"
            >添加</BaseButton
          >
          <div class="p-t10px">
            <BaseButton
              type="danger"
              :disabled="disabled || process_schedule_list.length == 1"
              @click="del(index)"
              >删除</BaseButton
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="tsx" setup>
import {
  ElDivider,
  ElCard,
  ElRow,
  ElForm,
  ElCol,
  ElInput,
  ElSelect,
  ElRadioGroup,
  ElRadio,
  ElDatePicker,
  ElOption,
  ElFormItem,
  type FormRules,
  ElMessageBox,
  ElUpload,
  ElMessage,
  ElLoading
} from 'element-plus'
import { BaseButton } from '@/components/Button'
import LookFileDialog from './LookFileDialog.vue'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useValidator } from '@/hooks/web/useValidator'
import { uploadFile as HttpUploadFile } from '@/api/common/index'
import { getUserListApi } from '@/api/login'

const show = ref<boolean>(false)
const uploadRefs = ref<InstanceType<typeof ElUpload>[]>([])
const lookFileDialogRef = ref<InstanceType<typeof LookFileDialog>>()
const formRefs = ref<InstanceType<typeof ElForm>[]>()
const { required } = useValidator()
const userList = ref<any[]>([])
const rules = reactive<FormRules>({
  serial_number: [{ ...required(), trigger: 'blur' }],
  processor_id: [{ ...required(), trigger: 'change' }],
  process_at: [{ ...required(), trigger: 'change' }],
  process_state: [{ ...required(), trigger: 'change' }],
  process_content: [{ ...required(), trigger: 'blur' }]
})

const lookIndex = ref(-1)
let userSelectFileList: File[] = []
let timer: any = null
const isUserSend = ref(true)
const process_schedule_list = ref<
  {
    id: string
    serial_number?: number
    processor_id?: string[]
    process_at?: string
    process_state?: number
    process_content?: string
    attachment_file_list?: string[]
  }[]
>([
  {
    id: '_' + new Date().getTime(),
    process_state: 1
  }
])

const props = defineProps({
  echoData: {
    type: Object,
    default: () => null
  },

  disabled: {
    type: Boolean,
    default: false
  }
})

const add = (index: number) => {
  process_schedule_list.value.splice(index + 1, 0, {
    process_state: 1,
    id: '_' + new Date().getTime()
  })
}

const del = (index: number) => {
  ElMessageBox.confirm('确定删除吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    process_schedule_list.value.splice(index, 1)
  })
}

const submit = async () => {
  for (const formRef of formRefs.value!) {
    try {
      await formRef.validate()
    } catch (error) {
      console.log(error)
      return false
    }
  }
  return process_schedule_list.value.map((item: any, index: number) => {
    item.process_at = new Date(item.process_at).getTime()
    item.processors = item.processor_id.map((item: any) => {
      const result = userList.value.find((e) => e.id == item)
      return {
        id: result?.id,
        name: result?.name
      }
    })
    item.serial_number = index
    if (item.id && (item.id + '').startsWith('_')) delete item.id
    return item
  })
}

const httpRequest = async ({ file }: { file: File }) => {
  const fileList = process_schedule_list.value[lookIndex.value]?.attachment_file_list || []
  const number = 9

  const allowedTypes = ['image/jpeg', 'image/png']
  const callback = () => {
    isUserSend.value = false
    userSelectFileList = []
    clearTimeout(timer)
    setTimeout(() => {
      isUserSend.value = true
    }, 1000)
  }
  if (!isUserSend.value) {
    return
  }

  if (!allowedTypes.includes(file.type)) {
    ElMessage.error(`文件 ${file.name} 类型不支持`)
    callback()
    return
  }

  if (file.size > 10 * 1024 * 1024) {
    ElMessage.error(`${file.name}文件大小不能超过 10MB`)
    callback()
    return
  }
  userSelectFileList.push(file)

  if (timer) {
    clearTimeout(timer)
    timer = null
  }
  timer = setTimeout(() => {
    if (fileList.length + userSelectFileList.length > number) {
      ElMessage.error(
        `最多上传${number}个附件，您已上传${fileList.length} ，本次选择${userSelectFileList.length}个文件，请删除后重新上传`
      )
      callback()
      return
    }
    const loadingInstance = ElLoading.service({
      lock: true,
      text: '上传中...',
      background: 'rgba(0, 0, 0, 0.7)'
    })
    const newPromist = userSelectFileList.map((item) => {
      return HttpUploadFile(item)
    })
    Promise.all(newPromist)
      .then((fileUrl) => {
        const lastFileList = process_schedule_list.value[lookIndex.value].attachment_file_list || []
        process_schedule_list.value[lookIndex.value].attachment_file_list = [
          ...lastFileList,
          ...(fileUrl as string[])
        ]
        ElMessage.success('上传成功')
      })
      .finally(() => {
        loadingInstance.close()
        callback()
      })
  }, 500)
}

const selectFile = (index: number) => {
  lookIndex.value = index
  uploadRefs.value[index]?.$el.querySelector('input[type="file"]').click()
}
const lookFile = (index: number) => {
  show.value = true
  lookIndex.value = index
}

const lookFileSubmit = async (data: any) => {
  process_schedule_list.value[lookIndex.value].attachment_file_list = data.map(
    (item: any) => item.title
  )
}

const getUserList = async () => {
  const res = await getUserListApi({
    page: 1,
    limit: 99999
  })
  userList.value = res.data.list || []
}

watch(
  () => props.echoData,
  (echoData) => {
    if (!echoData) return
    const { process_schedule_list: result } = echoData || {}
    if (!result || result?.length === 0) return
    const data = (result || []).map((item: any) => {
      const e = (item?.processors || []).map((e: any) => e.id) || []
      return {
        ...item,
        processor_id: e
      }
    })
    process_schedule_list.value = data
  },
  {
    deep: true,
    immediate: true
  }
)

const fileList = computed(() => {
  if (lookIndex.value == -1) return []
  return process_schedule_list.value[lookIndex.value]?.attachment_file_list || []
})
defineExpose({
  submit
})

onMounted(() => {
  getUserList()
})
</script>

<style lang="less" scoped>
.event-tracking {
  height: 100%;
}
</style>
