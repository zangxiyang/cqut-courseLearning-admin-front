<template>
  <div class="container">
    <Breadcrumb :items="['menu.userManager', 'userManager.auth']"/>
    <a-card class="general-card" :title="$t('userManager.auth')">

      <a-row style="margin-bottom: 16px">
        <a-col :span="16">
          <a-space>
            <a-button type="primary" @click="modalNewRoleVisible = true">
              <template #icon>
                <icon-plus />
              </template>
              新建角色
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
            title="角色名"
            data-index="roleName"
          />
          <a-table-column
            title="权限"
            data-index="role"
          />

          <a-table-column
            title="是否能被删除"
            data-index="canDel"
          >
            <template #cell="{ record }">
              <span v-if="record.canDel === 0" class="circle error"></span>
              <span v-else class="circle pass"></span>
              {{ record.canDel === 0 ? "不能删除":"能删除" }}
            </template>
          </a-table-column>
          <a-table-column
            :title="$t('searchTable.columns.operations')"
            data-index="operations"
          >
            <template #cell="{ record }">
              <a-popconfirm content="确认是否要进行删除(这是一个不可逆操作)"
                            @ok="confirmHandleDelRoleOk(record)"
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
    <a-modal title="新建角色"
             @cancel="modalHandleNewRoleCancel"
             @ok="modalHandleNewRoleOk"
             :ok-loading="modalOkLoading"
             :visible="modalNewRoleVisible">
      <a-form :model="modalNewRoleForm">
        <a-form-item field="roleName" label="权限角色名" required>
          <a-input v-model="modalNewRoleForm.roleName" allow-clear
                   placeholder="请输入要创建的新角色名"/>
        </a-form-item>
        <a-form-item field="role" label="role名" required>
          <a-input v-model="modalNewRoleForm.role" allow-clear
                   placeholder="请输入要创建的新角色名(英文)"/>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref, reactive } from 'vue';
  import { useI18n } from 'vue-i18n';
  import useLoading from '@/hooks/loading';
  import { queryPolicyList, PolicyRecord, PolicyParams } from '@/api/list';
  import { Pagination, Options } from '@/types/global';
  import { addNewRole, delRole, queryAuthInfo, RoleParams, RoleRecord } from "@/api/user-manager";
  import { HttpResponse } from "@/api/interceptor";
  import { Message } from "@arco-design/web-vue";
  import _ from "lodash";
  import { TableData } from "@arco-design/web-vue/es/table/interface.d";

  const { loading, setLoading } = useLoading(true);
  const renderData = ref<RoleRecord[]>([]);
  const basePagination: Pagination = {
    current: 1,
    pageSize: 10,
  };
  const pagination = reactive({
    ...basePagination,
  });

  const fetchData = async (
    params: RoleParams = { page: 1, size: 20 }
  ) => {
    setLoading(true);
    try {
      const { data } = await queryAuthInfo(params);
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

  // 新建角色
  const modalNewRoleVisible = ref<boolean>(false);
  const modalNewRoleForm = ref<{
    roleName: string,
    role: string
  }>({roleName: '', role: ''});
  const modalHandleNewRoleOk = () => {
    if (_.isNil(modalNewRoleForm.value.roleName) || _.trim(modalNewRoleForm.value.roleName) == '' ||
    _.isNil(modalNewRoleForm.value.role) || _.trim(modalNewRoleForm.value.role) == ''){
      Message.error("要创建的角色名不能为空");
      return;
    }
    fetchNewRole(modalNewRoleForm.value.roleName, modalNewRoleForm.value.role);
  }
  const modalHandleNewRoleCancel = () => {
    modalNewRoleVisible.value = false;
  }
  const fetchNewRole = async (roleName: string, role: string) => {
    // 开启ok loading 动画
    modalOkLoading.value = true;
    try {
      const {code} = await addNewRole(roleName,role) as unknown as HttpResponse;
      if (code === 200){
        // 新建成功后
        Message.success("创建新权限角色成功");
        // 重新刷新列表数据
        await fetchData();
        // 关闭模态框
        modalNewRoleVisible.value = false;
      }
    }catch (e){

    } finally {
      modalOkLoading.value = false;
    }
  }

  // 删除角色
  const confirmLoading = ref<boolean>(false);
  const confirmHandleDelRoleOk = (record: RoleRecord)=>{
    fetchDelRole(record.roleName);
  }
  const fetchDelRole = async (roleName: string)=>{
    confirmLoading.value = true;
    try {
      const {code} = await delRole(roleName) as unknown as HttpResponse;
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
