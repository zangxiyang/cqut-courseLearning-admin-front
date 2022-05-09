<template>
  <a-form
    ref="formRef"
    :model="formData"
    class="form"
    :label-col-props="{ span: 6 }"
    :wrapper-col-props="{ span: 18 }"
  >
    <a-form-item
      field="name"
      label="课程名称"
      :rules="[
        {
          required: true,
          message: '请输入课程名称',
        }
      ]"
    >
      <a-input
        v-model="formData.name"
        placeholder="请输入课程名称"
      />
    </a-form-item>
    <a-form-item
      field="subName"
      label="课程子标题"
      :rules="[
        {
          required: true,
          message: '请输入课程子标题',
        },
      ]"
    >
      <a-input v-model="formData.subName" placeholder="请输入课程子标题" />
    </a-form-item>
    <a-form-item
      field="authorTeacherId"
      label="课程老师"
      :rules="[
        {
          required: true,
          message: '任课教师不能为空',
        },
      ]"
    >
      <a-spin v-if="userDetailLoading" />
      <span v-if="userDetailLoading === false">{{ nickName }}</span>
    </a-form-item>

    <a-form-item
      field="classId"
      label="所属班级"
      :rules="[
        {
          required: true,
          message: '请选择班级',
        },
      ]"
    >

      <a-select
        v-model="formData.classId"
        placeholder="请选择课程所属班级"
        @focus="fetchClassList"
        :loading="classLoading"
        :options="classIdOptions" />
    </a-form-item>

    <a-form-item
      field="description"
      label="课程描述信息"
      row-class="keep-margin"
    >
      <a-textarea
        v-model="formData.description"
        placeholder="请输入课程描述"
        show-word-limit
        :max-length="500"
        allow-clear
      />
      <template #help>
        <span>描述信息会显示在课程详情页面右侧的 <strong>课程须知</strong> 中</span>
      </template>
    </a-form-item>

    <a-form-item
      field="content"
      label="课程详情"
      row-class="keep-margin"
    >
      <a-textarea
        v-model="formData.content"
        placeholder="请输入课程详情"
        show-word-limit
        :max-length="500"
        allow-clear
      />
      <template #help>
        <span>描述信息会显示在课程详情页面右侧的 <strong>老师告诉你能学到什么？</strong> 中</span>
      </template>
    </a-form-item>


    <a-form-item
      field="thumb"
      label="课程头图"
      row-class="keep-margin"
      :rules="{
          required: true,
          message: '请上传课程头图',
        }"
    >
      <a-upload
        :action="uploadAction"
        :fileList="file ? [file] : []"
        :show-file-list="false"
        :headers="{
          token
        }"
        :data="{
          fileType,
          userId,
          fileName
        }"
        @change="onChange"
        @progress="onProgress"
        @success="onSuccess"
        @error="onError"
      >
        <template #upload-button>
          <div
            :class="`arco-upload-list-item${
            file && file.status === 'error' ? ' arco-upload-list-item-error' : ''
          }`"
          >
            <div
              class="arco-upload-list-picture custom-upload-avatar"
              v-if="file && file.url"
            >
              <img :src="file.url" />
              <div class="arco-upload-list-picture-mask">
                <IconEdit />
              </div>
              <!--<a-progress
                v-if="file.status === 'uploading' && file.percent < 100"
                :percent="file.percent"
                type="circle"
                size="mini"
                :style="{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translateX(-50%) translateY(-50%)',
              }"
              />-->
              <a-spin
                :style="{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translateX(-50%) translateY(-50%)',
              }"
                v-if="file.status === 'uploading' && file.percent < 100" />
            </div>
            <div class="arco-upload-picture-card" v-else>
              <div class="arco-upload-picture-card-text">
                <IconPlus />
                <div style="margin-top: 10px; font-weight: 600">上传头图</div>
              </div>
            </div>
          </div>
        </template>
      </a-upload>
      <template #help>
        <span>课程头图会出现在课程详情页和外部的略缩图中</span>
      </template>
    </a-form-item>


    <a-form-item>
      <a-button type="primary" @click="onNextClick">
        下一步
      </a-button>
    </a-form-item>
  </a-form>
</template>

<script lang="ts" setup>
import { computed, PropType, ref, watch } from "vue";
import { FormInstance } from "@arco-design/web-vue/es/form";
import { getUserDetail, IModelCourseBaseInfo } from "@/api/course";
import { ClassRecord, queryClassList } from "@/api/user-manager";
import { Options } from "@/types/global";
import { getToken, getUserId } from "@/utils/auth";
import { FileItem } from "@arco-design/web-vue/es/upload/interfaces";
import { Message } from "@arco-design/web-vue";

const props = defineProps({
  clear: Boolean as PropType<boolean>
})
const emits = defineEmits(["changeStep","update:clear"]);
const formRef = ref<FormInstance>();
const formData = ref<IModelCourseBaseInfo>({
  name: "",
  subName: "",
  description: "",
  thumb: "",
  content: "",
});

watch(()=> props.clear,(val)=>{
  if (val === true){
    clearData();
    emits('update:clear', false);
  }
})

// 清空数据
const clearData = ()=>{
  formRef.value.resetFields();
  file.value = undefined;
}
defineExpose({
  clearData
})

// 获取当前的用户id
formData.value.authorTeacherId = getUserId();
const userDetailLoading = ref(true);
const nickName = ref();
const fetchUserDetail = async () => {
  try {
    const { data } = await getUserDetail(getUserId());
    nickName.value = data.nickName;
  } catch (e) {
    Message.error("获取用户昵称失败");
  } finally {
    userDetailLoading.value = false;
  }
};
fetchUserDetail();

// 请求班级列表信息
const classListData = ref<ClassRecord[]>([]);
const classIdOptions = computed<Options[]>(() => {
  return classListData.value.map((val) => {
    return {
      label: val.className,
      value: val.id
    };
  });
});
const classLoading = ref<boolean>(false);
const fetchClassList = async () => {
  classLoading.value = true;
  try {
    const { data } = await queryClassList();
    classListData.value = data;
  } catch (err) {

  } finally {
    classLoading.value = false;
  }
};


// 文件上传
const uploadAction = ref(`${import.meta.env.VITE_API_BASE_URL}/course-cos/cos/upload/img`);
const file = ref<FileItem>();
const token = ref(getToken());
const userId = ref(getUserId());
const fileType = ref();
const fileName = ref();
const onChange = (_, currentFile: FileItem) => {
  file.value = {
    ...currentFile
    // url: URL.createObjectURL(currentFile.file),
  };
  fileName.value = file.value.name;
  fileType.value = file.value.file.type;
};
const onProgress = (currentFile) => {
  file.value = currentFile;
};
const onSuccess = (resp) => {
  console.log(resp);

  formData.value.thumb = resp.response.data.url;
};
const onError = (resp) => {
  console.log(resp);
  if (resp.response.code !== 200) {
    Message.error(resp.response.message);
  }
};


const onNextClick = async () => {
  const res = await formRef.value?.validate();
  if (!res) {
    emits("changeStep", "forward", { ...formData.value });
  }
};
</script>

<style scoped lang="less">

:deep(.arco-upload-list-item) {
  margin-top: 0;
}

.container {
  padding: 20px;

  .keep-margin {
    margin-bottom: 20px;
  }
}

.wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 64px 0;
  background-color: var(--color-bg-2);
}

.steps {
  margin-bottom: 36px;
}

.form {
  width: 500px;
}

.form-content {
  padding: 8px 50px 0 30px;
}
</style>
