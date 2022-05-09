<template>
  <div class="container">
    <Breadcrumb :items="['menu.userManager', 'userManager.class']"/>
    <a-card class="general-card" :title="$t('userManager.class')">

      <a-row style="margin-bottom: 16px">
        <a-col :span="16">
          <a-space>
            <a-button type="primary" @click="modalNewVisible = true">
              <template #icon>
                <icon-plus />
              </template>
              新建班级
            </a-button>
            <a-button @click="fetchData()">
              <template #icon>
                <icon-refresh/>
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
          共{{pagination.total}}条数据
        </template>
        <template #columns>
          <a-table-column
            title="Id"
            data-index="id"
          />
          <a-table-column
            title="班级名"
            data-index="className"
          />

          <a-table-column
            title="班级描述"
            data-index="description">
            <template #cell="{record}">
              <template v-if="_.isNil(record.description) || _.trim(record.description) ===''">
                暂无描述
              </template>
              <template v-else>
                {{record.description}}
              </template>
            </template>
          </a-table-column>
          <a-table-column
            :title="$t('searchTable.columns.operations')"
            data-index="operations"
          >
            <template #cell="{ record }">
              <a-popconfirm content="确认是否要进行删除(这是一个不可逆操作)"
                            @ok="confirmHandleDelRoleOk(record)"
                            :ok-loading="confirmLoading"
                            type="warning">
                <a-button v-permission="['admin']"
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
    <a-modal title="新建班级"
             @cancel="modalHandleNewRoleCancel"
             @ok="modalHandleNewClassOk"
             :ok-loading="modalOkLoading"
             :visible="modalNewVisible">
      <a-form :model="modalNewClassForm">
        <a-form-item field="className" label="班级名" required>
          <a-input v-model="modalNewClassForm.className" allow-clear
                   placeholder="请输入要创建的新班级名"/>
        </a-form-item>
        <a-form-item field="description" label="描述信息">
          <a-textarea v-model="modalNewClassForm.description" allow-clear
                      placeholder="请输入本班级的一些描述信息"
                      :max-length="200"
                      show-word-limit/>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from "vue";
import useLoading from "@/hooks/loading";
import { Pagination } from "@/types/global";
import {
  addNewClass, ClassRecord, delClass,
  delRole,
  NewClassRequestDto,
  queryAuthInfo,
  queryClass,
  RoleParams,
  RoleRecord
} from "@/api/user-manager";
import { HttpResponse } from "@/api/interceptor";
import { Message } from "@arco-design/web-vue";
import _ from "lodash";
import { BaseParams } from "@/api/base-model";

const { loading, setLoading } = useLoading(true);
  const renderData = ref<ClassRecord[]>([]);
  const basePagination: Pagination = {
    current: 1,
    pageSize: 10,
  };
  const pagination = reactive({
    ...basePagination,
  });

  const fetchData = async (
    params: BaseParams = { page: 1, size: 20 }
  ) => {
    setLoading(true);
    try {
      const { data } = await queryClass(params);
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
    fetchData({ ...basePagination, page: current, size:basePagination.pageSize });
  };

  fetchData();

  // 模态框ok loading 动画
  const modalOkLoading = ref<boolean>(false);

  // 新建班级
  const modalNewVisible = ref<boolean>(false);
  const modalNewClassForm = ref<NewClassRequestDto>({className: ''});
  const modalHandleNewClassOk = () => {
    if (_.isNil(modalNewClassForm.value.className) || _.trim(modalNewClassForm.value.className) == ''){
      Message.error("要创建的班级名名不能为空");
      return;
    }
    fetchNewClass(modalNewClassForm.value);
  }
  const modalHandleNewRoleCancel = () => {
    modalNewClassForm.value = {className: ''}
    modalNewVisible.value = false;
  }
  const fetchNewClass = async (newClassForm: NewClassRequestDto) => {
    // 开启ok loading 动画
    modalOkLoading.value = true;
    try {
      const {code} = await addNewClass(newClassForm) as unknown as HttpResponse;
      if (code === 200){
        // 新建成功后
        Message.success("创建新班级成功");
        // 重新刷新列表数据
        await fetchData();
        // 关闭模态框
        modalNewVisible.value = false;
      }
    }catch (e){

    } finally {
      modalOkLoading.value = false;
    }
  }

  // 删除班级
  const confirmLoading = ref<boolean>(false);
  const confirmHandleDelRoleOk = (record: ClassRecord)=>{
    fetchDelRole(record.className);
  }
  const fetchDelRole = async (className: string)=>{
    confirmLoading.value = true;
    try {
      const {code} = await delClass(className) as unknown as HttpResponse;
      if (code === 200) {
        Message.success("删除成功");
        // 重新加载列表数据
        await fetchData();
      }
    } finally {
      confirmLoading.value = false;
    }
  }
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
