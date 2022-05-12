<template>
  <div class="container">
    <Breadcrumb :items="['menu.course', 'menu.courseFile']" />
    <a-card class="general-card" :title="$t('menu.courseFile')">

      <a-row style="margin-bottom: 16px">
        <a-col :span="16">
          <a-space>
            <a-upload
              :action="uploadAction"
              :fileList="file ? [file] : []"
              :show-file-list="false"
              :headers="{token}"
              :data="{...fileParams,userId,courseId}"
              @change="onChange"
              @success="onSuccess"
              @before-upload="onBeforeUpload"
              @error="onError"
              ref="uploadRef"
            >
              <template #upload-button>
                <a-button type="primary" >
                  <template #icon>
                    <icon-upload/>
                  </template>
                  上传文件
                </a-button>
              </template>
            </a-upload>
            <a-button @click="fetchData()">
              <template #icon>
                <icon-refresh />
              </template>
              刷新数据
            </a-button>
          </a-space>
        </a-col>
      </a-row>
      <a-table
        row-key="id"
        :loading="loading"
        :pagination="pagination"
        :data="renderData"
        :bordered="false"
        @page-change="onPageChange"
      >
        <template #pagination-left>
          共{{ pagination.total }}条数据
        </template>
        <template #columns>
          <a-table-column
            title="Id"
            data-index="id"
          />
          <a-table-column
            title="文件名"
            data-index="fileName"/>


          <a-table-column
            title="文件类型"
            data-index="fileType"
          />
          <a-table-column
            title="上传者"
            data-index="userName"
          />

          <a-table-column
            title="课程文件"
            data-index="fileName">
            <template #cell="{record}">
              <template v-if="record.fileName !== null">
                <a :href="record.url" target="_blank">
                  <icon-file />
                  <span>{{ record.fileName }}</span>
                </a>
              </template>
              <template v-else>

              </template>
            </template>
          </a-table-column>
          <a-table-column title="发布时间" data-index="createDate" />



          <a-table-column
            :title="$t('searchTable.columns.operations')"
            data-index="operations"
          >
            <template #cell="{ record }">
              <a-popconfirm content="确认是否要进行删除(这是一个不可逆操作)"
                            @ok="confirmHandleDelCourseOk(record)"
                            :ok-loading="confirmLoading"
                            type="warning">
                <a-button v-permission="['admin','teacher']"
                          type="text" size="small"
                          status="danger">
                  删除
                </a-button>
              </a-popconfirm>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
import { computed, h, reactive, ref } from "vue";
import useLoading from "@/hooks/loading";
import { Options, Pagination } from "@/types/global";
import { FormItem, Message, Modal, Option, Select } from "@arco-design/web-vue";
import { Course, CourseFile, delCourse, delCourseFile, queryCourse, queryCourseFile } from "@/api/course";
import { BaseParams } from "@/api/base-model";
import { FileItem } from "@arco-design/web-vue/es/upload/interfaces";
import { getToken, getUserId } from "@/utils/auth";

const { loading, setLoading } = useLoading(true);
const renderData = ref<CourseFile[]>([]);
const basePagination: Pagination = {
  current: 1,
  pageSize: 10
};
const pagination = reactive({
  ...basePagination
});

const fetchData = async (
  params: BaseParams = { page: 1, size: 20 }
) => {
  setLoading(true);
  try {
    const { data } = await queryCourseFile(params);
    renderData.value = data.list;
    pagination.current = params.page;
    pagination.total = data.total;
  } catch (err) {
    // you can report use errorHandler or other
  } finally {
    setLoading(false);
  }
};
const onPageChange = (current: number) => {
  fetchData({ ...basePagination, page: current, size: basePagination.pageSize });
};

fetchData();



// 上传文件
const uploadAction = ref(`${import.meta.env.VITE_API_BASE_URL}/course-course/course/admin/course/file`);
const file = ref<FileItem>();
const token = ref(getToken());
const userId = ref(getUserId());
const courseId = ref();
const fileParams = reactive({
  fileName: '',
  fileType: ''
})

const onChange = (_, currentFile: FileItem) => {
  file.value = {} as FileItem // init
  file.value = {
    ...currentFile
    // url: URL.createObjectURL(currentFile.file),
  };
};

const onBeforeUpload = (file)=>{
  return new Promise(async (resolve, reject) => {
    fileParams.fileName = file.name;
    fileParams.fileType = file.type;

    Modal.confirm({
      title: '请选择课程并再次确认',
      content: ()=>{
        /*<a-select
        v-model="modalTeacherForm.authorTeacherId"
        placeholder="请选择指派的老师"
      @focus="fetchQueryTeacher"
      :loading="teacherLoading"
      :options="teacherOptions" />*/
        return h('div', {class: 'info-modal-content'}, [
          h(FormItem, {label: '课程'}, [
            h(Select,{modelValue: courseId.value,
              "onUpdate:modelValue": value => courseId.value = value,
              loading: courseLoading.value,
              placeholder: '请选择上传的课程',
              onFocus: fetchCourseList},courseIdOptions.value.map((item)=>{
                return h(Option,{label: item.label,value: item.value})
            }))
          ])
        ])
      },
      onOk: () => resolve(true),
      onCancel: () => reject('cancel'),
    });
  });
}

const onSuccess = ({response}) => {
  console.log(response);
  if (response.code !== 200) {
    Message.error(response.message);
    return;
  }
  Message.success("文件上传成功");
  // 刷新列表
  fetchData({page: basePagination.current, size: basePagination.pageSize});
};
const onError = (resp) => {
  console.log(resp);
  if (resp.response.code !== 200) {
    Message.error(resp.response.message);
  }
};

// 请求课程列表
const courseListData = ref<Course[]>([]);
const courseIdOptions = computed<Options[]>(() => {
  return courseListData.value.map((val) => {
    return {
      label: val.name,
      value: val.id
    };
  });
});
const courseLoading = ref<boolean>(false);
const fetchCourseList = async () => {
  courseLoading.value = true;
  try {
    const { data } = await queryCourse({page:1, size: 999});
    courseListData.value = data.list;
  } catch (err) {

  } finally {
    courseLoading.value = false;
  }
};






// 删除课程
const confirmLoading = ref<boolean>(false);
const confirmHandleDelCourseOk = (record: CourseFile) => {
  fetchDelCourse(record.courseId,record.cosId);
};
const fetchDelCourse = async (courseId: number, cosId: number) => {
  confirmLoading.value = true;
  try {
    await delCourseFile(cosId, courseId);
    Message.success("删除成功");
    // 重新加载列表数据
    await fetchData();
  } finally {
    confirmLoading.value = false;
  }
};
</script>

<style scoped lang="less">
.container {
  padding: 0 20px 20px 20px;
}

:deep(.arco-table-th) {
  &:last-child {
    .arco-table-th-item-title {
      margin-left: 16px;
    }
  }
}

a{
  display: flex;
  align-items: center;
  text-decoration: none;
  font-size: 14px;
  color: rgb(var(--primary-6));
  transition: .15s linear;
  -webkit-transition: .15s linear;
  &:hover{
    color: rgba(var(--primary-6),.6);;
  }
}
</style>
