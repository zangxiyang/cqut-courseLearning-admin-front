<template>
  <div class="container">
    <Breadcrumb :items="['menu.userManager', 'userManager.auth']"/>
    <a-card class="general-card" :title="$t('userManager.auth')">

      <a-row style="margin-bottom: 16px">
        <a-col :span="16">
          <a-space>
            <a-button type="primary">
              <template #icon>
                <icon-plus />
              </template>
              新建角色
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
              <a-button v-permission="['admin']"
                        type="text" size="small"
                        status="danger"
                        :disabled="record.canDel === 0">
                删除
              </a-button>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref, reactive } from 'vue';
  import { useI18n } from 'vue-i18n';
  import useLoading from '@/hooks/loading';
  import { queryPolicyList, PolicyRecord, PolicyParams } from '@/api/list';
  import { Pagination, Options } from '@/types/global';
  import { queryAuthInfo, RoleParams, RoleRecord } from "@/api/user-manager";

  const generateFormModel = () => {
    return {
      id: '',
      roleName: '',
      canDel: '',
    };
  };
  const { loading, setLoading } = useLoading(true);
  const { t } = useI18n();
  const renderData = ref<RoleRecord[]>([]);
  const formModel = ref(generateFormModel());
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

  const search = () => {
    fetchData({
      ...basePagination,
      ...formModel.value,
    } as unknown as RoleParams);
  };
  const onPageChange = (current: number) => {
    fetchData({ ...basePagination, page: current, size:basePagination.pageSize });
  };

  fetchData();
  const reset = () => {
    formModel.value = generateFormModel();
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
