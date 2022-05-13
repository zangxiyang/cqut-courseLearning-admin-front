<template>
  <div class="container">
    <Breadcrumb :items="['menu.course', 'menu.courseManager']" />
    <a-card class="general-card" :title="$t('menu.courseManager')">

      <a-row style="margin-bottom: 16px">
        <a-col :span="16">
          <a-space>
            <a-button type="primary" @click="$router.push('/course/create')">
              <template #icon>
                <icon-plus />
              </template>
              新建课程
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
            title="课程名"
            data-index="name">
            <template #cell="{record}">
              <a-avatar :size="40" shape="square" style="margin-right: 5px">
                <img :src="record.thumb">
              </a-avatar>
              <span>{{ record.name }}</span>
            </template>
          </a-table-column>
          <a-table-column
            title="教师"
            data-index="teacherName"
          />

          <a-table-column
            title="所属班级"
            data-index="className"
          />
          <a-table-column title="发布时间" data-index="publishDate" />

          <a-table-column
            title="状态"
            data-index="status">

            <template #cell="{record}">
              <a-switch
                :default-checked="record.status === 1"
                :loading="record.statusLoading"
                @change="changeCourseStatus(record)"
                checked-color="#19af00"
                unchecked-color="#F53F3F">
                <template #checked>
                  上架
                </template>
                <template #unchecked>
                  下架
                </template>
              </a-switch>
            </template>

          </a-table-column>


          <a-table-column
            :title="$t('searchTable.columns.operations')"
            data-index="operations"
          >
            <template #cell="{ record }">
              <a-button v-permission="['admin']"
                        @click="openModalTeacher(record)"
                        size="small"
                        type="text">
                指派教师
              </a-button>
              <a-button type="text" size="small" @click="modalKnowledgeOpen(record.id)">
                知识点
              </a-button>
              <a-popconfirm content="确认是否要进行删除(这是一个不可逆操作)"
                            @ok="confirmHandleDelCourseOk(record)"
                            :ok-loading="confirmLoading"
                            type="warning">
                <a-button v-permission="['admin','teacher']"
                          type="text" size="small"
                          status="danger"
                          :disabled="record.canDel === 0">
                  删除
                </a-button>
              </a-popconfirm>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>
    <a-modal title="指派教师"
             @cancel="modalHandleTeacherCancel"
             @ok="modalHandleTeacherOk"
             :ok-loading="modalOkLoading"
             :visible="modalTeacherVisible">
      <a-form :model="modalTeacherForm">
        <a-form-item field="authorTeacherId" label="教师" required>
          <a-select
            v-model="modalTeacherForm.authorTeacherId"
            placeholder="请选择指派的老师"
            @focus="fetchQueryTeacher"
            :loading="teacherLoading"
            :options="teacherOptions" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal title="知识点管理" :ok-loading="modalOkLoading"
             @ok="modalKnowledgeOk"
             :ok-button-props="{
               disabled: knowledgeLoading
             }"
             @cancel="modalKnowledgeCancel" :visible="modalKnowledgeVisible">
      <a-form :model="modalKnowledgeForm">
        <a-form-item field="knowledgeIds" label="知识点">
          <a-select
            v-model="modalKnowledgeForm.knowledgeIds"
            placeholder="请选择绑定的知识点"
            :max-tag-count="5"
            multiple
            @focus="fetchQueryKnowledge"
            :loading="knowledgeLoading"
            :options="knowledgeOptions" />
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
import { Message } from "@arco-design/web-vue";
import _, { values } from "lodash";
import { TableData } from "@arco-design/web-vue/es/table/interface.d";
import {
  bindKnowledge,
  BindKnowledge,
  Course, delBindKnowledge,
  delCourse, Knowledge, queryBindKnowledge,
  queryCourse, queryKnowledge,
  queryTeacher,
  Teacher,
  updateCourseBaseInfo
} from "@/api/course";
import { BaseParams } from "@/api/base-model";

const { loading, setLoading } = useLoading(true);
const renderData = ref<Course[]>([]);
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
    const { data } = await queryCourse(params);
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

// 指派教师
const modalTeacherVisible = ref<boolean>(false);
const modalTeacherForm = ref<Partial<Course>>({});
const openModalTeacher = async (record: Course) => {
  modalTeacherForm.value.id = record.id;
  modalTeacherForm.value.authorTeacherId = record.authorTeacherId;
  await fetchQueryTeacher();
  modalTeacherVisible.value = true;
};
const modalHandleTeacherOk = () => {
  if (_.isNil(modalTeacherForm.value.authorTeacherId) && _.isNil(modalTeacherForm.value.id)) {
    Message.error("课程和教师不能为空，请检查后重新提交");
    return;
  }
  fetchOrderTeacher();
};
const modalHandleTeacherCancel = () => {
  modalTeacherForm.value = {} as Course;
  modalTeacherVisible.value = false;
};
const fetchOrderTeacher = async () => {
  // 开启ok loading 动画
  modalOkLoading.value = true;
  try {
    // 新建成功后
    await updateCourseBaseInfo(modalTeacherForm.value);
    Message.success("指派教师成功");
    // 重新刷新列表数据
    await fetchData();
    // 关闭模态框
    modalTeacherVisible.value = false;
  } catch (e) {

  } finally {
    modalOkLoading.value = false;
  }
};


// 上架下架课程
const changeCourseStatus = async (record: Course)=>{
  record.statusLoading = true;
  try {
    await updateCourseBaseInfo({ id: record.id, status: record.status === 0? 1: 0 });
    Message.success("课程状态更新成功");
  } catch (e){
    // 回退
    record.status = record.status === 0 ? 1: 0;
  } finally {
    record.statusLoading = false;
  }
}

// 加载老师列表
const teacherListData = ref<Teacher[]>([]);
const teacherLoading = ref(false);
const fetchQueryTeacher = async () => {
  teacherLoading.value = true;
  try {
    const { data } = await queryTeacher();
    teacherListData.value = data;
  } catch (e) {

  } finally {
    teacherLoading.value = false;
  }
};
const teacherOptions = computed<Options[]>(() => {
  return teacherListData.value.map((val) => {
    return {
      label: val.nickName,
      value: val.id
    };
  });
});

// 知识点管理
const modalKnowledgeVisible = ref(false);
const modalKnowledgeForm = ref<BindKnowledge>({
  courseId: -1,
  knowledgeIds: []
});
const modalKnowledgeOpen = (courseId: number) => {
  modalKnowledgeForm.value.courseId = courseId;
  modalKnowledgeVisible.value = true;
  fetchQueryBindKnowledge(courseId);
};
const modalKnowledgeCancel = () => {
  modalKnowledgeForm.value.courseId = -1;
  modalKnowledgeForm.value.knowledgeIds = [];
  modalKnowledgeVisible.value = false;
};
const modalKnowledgeOk = () => {
  fetchBindKnowledge();
};

const fetchQueryBindKnowledge = async (courseId: number) => {
  knowledgeLoading.value = true;
  try {
    await fetchQueryKnowledge();
    const { data } = await queryBindKnowledge(courseId);
    modalKnowledgeForm.value.knowledgeIds = data;
  } finally {
    knowledgeLoading.value = false;
  }
};
const fetchBindKnowledge = async () => {
  modalOkLoading.value = true;
  try {
    const { message } = await bindKnowledge(modalKnowledgeForm.value);
    Message.success(message);
    modalKnowledgeCancel();
  }
  finally {
    modalOkLoading.value = false;
  }
};

// 加载知识点列表
const knowledgeListData = ref<Knowledge[]>([]);
const knowledgeLoading = ref(false);
const fetchQueryKnowledge = async () => {
  knowledgeLoading.value = true;
  try {
    const { data } = await queryKnowledge({ page: 1, size: 1000 });
    knowledgeListData.value = data.list;
  } catch (e) {

  } finally {
    knowledgeLoading.value = false;
  }
};
const knowledgeOptions = computed<Options[]>(() => {
  return knowledgeListData.value.map((val) => {
    return {
      label: val.name,
      value: val.id
    };
  });
});


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
</style>
