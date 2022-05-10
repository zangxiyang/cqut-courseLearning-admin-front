<template>
  <div class="container">
    <Breadcrumb :items="['menu.course', 'menu.knowledgeManager']" />
    <a-card class="general-card" :title="$t('menu.knowledgeManager')">

      <a-row style="margin-bottom: 16px">
        <a-col :span="16">
          <a-space>
            <a-button type="primary" @click="modalKnowledgeVisible = true">
              <template #icon>
                <icon-plus />
              </template>
              新建知识点
            </a-button>
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
            title="知识点名"
            data-index="name"/>


          <a-table-column
            title="描述信息"
            data-index="description"
          />

          <a-table-column
            title="知识点文件"
            data-index="fileName">
            <template #cell="{record}">
              <template v-if="record.fileName !== null">
                <a :href="record.url" target="_blank">
                  <icon-file />
                  <span>{{ record.fileName }}</span>
                </a>
              </template>
              <template v-else>
                <!-- 上传文件 -->
                <a-upload
                  :action="uploadAction"
                  :fileList="file ? [file] : []"
                  :show-file-list="false"
                  :headers="{token}"
                  :data="{...fileParams,userId,'knowledgeId': record.id}"
                  @change="onChange"
                  @success="onSuccess"
                  @before-upload="onBeforeUpload"
                  @error="onError"
                  ref="uploadRef"
                />
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
    <a-modal title="新建知识点"
             @cancel="modalHandleKnowledgeCancel"
             @ok="modalHandleKnowledgeOk"
             :ok-loading="modalOkLoading"
             :visible="modalKnowledgeVisible">
      <a-form :model="modalKnowledgeForm">
        <a-form-item field="name" label="知识点名称" required>
          <a-input v-model="modalKnowledgeForm.name" placeholder="请输入知识点名称"/>
        </a-form-item>
        <a-form-item field="description" label="知识点描述">
          <a-textarea v-model="modalKnowledgeForm.description"
                      :max-length="500"
                      allow-clear
                      show-word-limit
                      placeholder="请输入知识点描述"/>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, reactive } from "vue";
import { useI18n } from "vue-i18n";
import useLoading from "@/hooks/loading";
import { queryPolicyList, PolicyRecord, PolicyParams } from "@/api/list";
import { Pagination, Options } from "@/types/global";
import { addNewRole, delRole, queryAuthInfo, RoleParams, RoleRecord } from "@/api/user-manager";
import { HttpResponse } from "@/api/interceptor";
import { Message, Modal } from "@arco-design/web-vue";
import _ from "lodash";
import { TableData } from "@arco-design/web-vue/es/table/interface.d";
import {
  addKnowledge,
  Course,
  delCourse,
  Knowledge,
  queryCourse,
  queryKnowledge,
  queryTeacher,
  Teacher,
  updateCourseBaseInfo
} from "@/api/course";
import { BaseParams } from "@/api/base-model";
import { FileItem } from "@arco-design/web-vue/es/upload/interfaces";
import { getToken, getUserId } from "@/utils/auth";

const { loading, setLoading } = useLoading(true);
const renderData = ref<Knowledge[]>([]);
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
    const { data } = await queryKnowledge(params);
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

// 模态框ok loading 动画
const modalOkLoading = ref<boolean>(false);

// 新建知识点
const modalKnowledgeVisible = ref<boolean>(false);
const modalKnowledgeForm = ref<Knowledge>({});


const modalHandleKnowledgeOk = () => {
  // if (_.isNil(modalKnowledgeForm.value.authorTeacherId) && _.isNil(modalKnowledgeForm.value.id)) {
  //   Message.error("课程和教师不能为空，请检查后重新提交");
  //   return;
  // }
  // fetchOrderTeacher();
};
const modalHandleKnowledgeCancel = () => {
  modalKnowledgeForm.value = {} as Knowledge;
  modalKnowledgeVisible.value = false;
};

const fetchAddKnowledge = async () => {
  // 开启ok loading 动画
  modalOkLoading.value = true;
  try {
    // 新建成功后
    await addKnowledge(modalKnowledgeForm.value);
    Message.success("添加知识点成功");
    // 重新刷新列表数据
    await fetchData();
    // 关闭模态框
    modalKnowledgeVisible.value = false;
  } catch (e) {

  } finally {
    modalOkLoading.value = false;
  }
};


// 上传文件
const uploadAction = ref(`${import.meta.env.VITE_API_BASE_URL}/course-course/know/admin/know/file`);
const file = ref<FileItem>();
const token = ref(getToken());
const userId = ref(getUserId());
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
  return new Promise((resolve, reject) => {
    fileParams.fileName = file.name;
    fileParams.fileType = file.type;
    Modal.confirm({
      title: '请再次确认',
      content: `请确认上传文件名: ${fileParams.fileName}, 文件类型: ${fileParams.fileType}的文件`,
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


// 上架下架课程
const switchLoading = ref(false);
const fetchSwitchCourseStatus = async (record: Course) => {
  switchLoading.value = true;
  try {
    const id = record.id;
    const status = record.status === 0 ? 1 : 0;
    await updateCourseBaseInfo({ id, status });
    Message.success("课程状态更新成功");
  } finally {
    switchLoading.value = false;
  }
};


// 删除课程
const confirmLoading = ref<boolean>(false);
const confirmHandleDelCourseOk = (record: Course) => {
  fetchDelCourse(record.id);
};
const fetchDelCourse = async (id: number) => {
  confirmLoading.value = true;
  try {
    await delCourse(id);
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
