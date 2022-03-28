<template>
  <div class="container">
    <Breadcrumb :items="['menu.userManager', 'userManager.user']" />
    <a-card class="general-card" :title="$t('userManager.user')">
      <a-row>
        <a-col :flex="1">
          <a-form
            :model="formModel"
            :label-col-props="{ span: 6 }"
            :wrapper-col-props="{ span: 18 }"
            label-align="right"
          >
            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item
                  field="id"
                  label="Id"
                >
                  <a-input
                    v-model="formModel.id"
                    placeholder="请输入用户id"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item field="userName" label="用户名">
                  <a-input
                    v-model="formModel.userName"
                    placeholder="请输入用户名(模糊查询)"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item
                  field="role"
                  label="角色权限"
                >
                  <a-select
                    v-model="formModel.roleId"
                    :options="roleOptions"
                    @focus="fetchRoleList"
                    placeholder="请选择查询的角色权限"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item
                  field="phone"
                  label="手机号"
                >
                  <a-input
                    v-model="formModel.phone"
                    placeholder="请输入要查询的手机号"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item
                  field="createDate"
                  label="创建时间"
                >
                  <a-range-picker
                    style="width: 100%"
                    @change="handleCreateDatePicker"
                    disabled
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item
                  field="lastLoginDate"
                  label="最后登录时间"
                >
                  <a-range-picker
                    style="width: 100%"
                    disabled
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item
                  field="classId"
                  label="班级"
                >
                  <a-select
                    v-model="formModel.classId"
                    :options="classIdOptions"
                    placeholder="请选择查询的班级"
                    @focus="fetchClassList"
                    :loading="classLoading"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item
                  field="classId"
                  label="性别"
                >
                  <a-select
                    v-model="formModel.sex"
                    :options="sexOptions"
                    placeholder="请选择查询的性别"
                  />
                </a-form-item>
              </a-col>

            </a-row>
          </a-form>
        </a-col>
        <a-divider style="height: 84px" direction="vertical" />
        <a-col :flex="'86px'" style="text-align: right">
          <a-space direction="vertical" :size="18">
            <a-button type="primary" @click="search">
              <template #icon>
                <icon-search />
              </template>
              {{ $t("searchTable.form.search") }}
            </a-button>
            <a-button @click="reset">
              <template #icon>
                <icon-refresh />
              </template>
              {{ $t("searchTable.form.reset") }}
            </a-button>
          </a-space>
        </a-col>
      </a-row>
      <a-divider style="margin-top: 0" />
      <a-row style="margin-bottom: 16px">
        <a-col :span="16">
          <a-space>
            <a-button type="primary" @click="modalNewUserVisible = true">
              <template #icon>
                <icon-plus />
              </template>
              新建用户
            </a-button>
            <a-upload action="/">
              <template #upload-button>
                <a-button disabled>
                  批量导入
                </a-button>
              </template>
            </a-upload>
            <a-button @click="fetchData({page: basePagination.current, size: basePagination.pageSize,
            ...formModel})">
              <template #icon>
                <icon-refresh />
              </template>
              刷新数据
            </a-button>
          </a-space>
        </a-col>
        <a-col :span="8" style="text-align: right">
          <a-button disabled>
            <template #icon>
              <icon-download />
            </template>
            导出数据
          </a-button>
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
            title="用户名"
            data-index="userName">
            <template #cell="{record}">
              <a-popover>
                <span class="pointer-cur">{{ record.userName }}</span>
                <template #title>
                  <a-tag>
                    <template #icon>
                      <icon-message />
                    </template>
                    描述信息
                  </a-tag>
                </template>
                <template #content>
                  <template v-if="record.sex === 0">
                    {{ record.description == null ? "他很懒,暂时没有描述或自我介绍" : record.description }}
                  </template>
                  <template v-else>
                    {{ record.description == null ? "她很懒,暂时没有描述或自我介绍" : record.description }}
                  </template>
                </template>
              </a-popover>
            </template>
          </a-table-column>
          <a-table-column
            title="昵称"
            data-index="nickName"
          />
          <a-table-column
            title="性别"
            data-index="sex"
          >
            <template #cell="{ record }">
              <template v-if="record.sex === 0">
                <a-tag color="purple">
                  <template #icon>
                    <icon-man />
                  </template>
                  男
                </a-tag>
              </template>
              <template v-else-if="record.sex === 1">
                <a-tag color="magenta">
                  <template #icon>
                    <icon-woman />
                  </template>
                  女
                </a-tag>
              </template>
            </template>
          </a-table-column>
          <a-table-column
            title="权限角色"
            data-index="roleName"
          />
          <a-table-column
            title="手机号"
            data-index="phone"
          />
          <a-table-column
            title="班级"
            data-index="className"
          >
            <template #cell="{record}">
              <a-popover>
                <span class="pointer-cur">{{ record.className }}</span>
                <template #title>
                  <a-tag>
                    <template #icon>
                      <icon-book />
                    </template>
                    学校
                  </a-tag>
                </template>
                <template #content>
                  <template v-if="record.sex === 0">
                    {{ record.description == null ? "他很懒,暂时还没有填写学校信息" : record.school }}
                  </template>
                  <template v-else>
                    {{ record.description == null ? "她很懒,暂时还没有填写学校信息" : record.school }}
                  </template>
                </template>
              </a-popover>
            </template>
          </a-table-column>
          <a-table-column data-index="createDate" title="创建时间">
            <template #cell="{record}">
              <a-popover>
                <span class="pointer-cur">{{ record.createDate }}</span>
                <template #title>
                  <a-tag color="green">
                    <template #icon>
                      <icon-moon />
                    </template>
                    最后登录时间
                  </a-tag>
                </template>
                <template #content>
                  {{ record.lastLoginDate != null ? record.lastLoginDate : "从未登录" }}
                </template>
              </a-popover>
            </template>
          </a-table-column>


          <a-table-column
            title="操作"
            data-index="operations"
          >
            <template #cell="{record}">
              <a-space>
                <a-button v-permission="['admin']"
                          type="text"
                          size="small"
                          status="danger"
                          :disabled="record.roleName === '管理员'"
                          @click="openModalChangeRole(record)">
                  编辑权限
                </a-button>
                <a-button v-permission="['admin']" type="text" size="small" @click="openModalChangeUserInfo(record)">
                  编辑信息
                </a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>
    <a-modal :visible="modalNewUserVisible"
             title="新建用户"
             :ok-loading="modalNewUserOkLoading"
             @ok="modalHandleOk"
             @cancel="modalHandleCancel">
      <a-form :model="modalNewUserForm" ref="newUserFormRef">
        <a-form-item field="userName" label="用户名" required>
          <a-input
            placeholder="请输入用户名"
            v-model="modalNewUserForm.userName" />
        </a-form-item>
        <a-form-item field="passWord" label="密码" required>
          <a-input-password
            allow-clear
            placeholder="请输入密码"
            v-model="modalNewUserForm.passWord" />
        </a-form-item>
        <a-form-item field="phone" label="手机号" required>
          <a-input allow-clear placeholder="请输入手机号" v-model="modalNewUserForm.phone" />
        </a-form-item>
        <a-form-item field="nickName" label="昵称">
          <a-input
            placeholder="请输入昵称"
            v-model="modalNewUserForm.nickName" />
        </a-form-item>
        <a-form-item field="sex" label="性别">
          <a-select
            placeholder="请选择性别"
            v-model="modalNewUserForm.sex"
            :options="sexOptions" />
        </a-form-item>
        <a-form-item field="roleId" label="用户角色">
          <a-select
            v-model="modalNewUserForm.roleId"
            placeholder="请选择用户角色">
            <a-option :value="2">老师</a-option>
            <a-option :value="3">学生</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="classId" label="班级">
          <a-select
            v-model="modalNewUserForm.classId"
            placeholder="请选择用户班级"
            @focus="fetchClassList"
            :loading="classLoading"
            :options="classIdOptions" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal title="编辑权限角色" :visible="modalChangeRoleVisible"
             @ok="fetchChangeRole(modalChangeRoleForm.userName, modalChangeRoleForm.roleId)"
             @cancel="modalChangeRoleVisible = false">
      <a-form :model="modalChangeRoleForm">
        <a-form-item field="roleId" label="权限角色" required>
          <a-select v-model="modalChangeRoleForm.roleId" placeholder="请选择角色">
            <a-option :value="2">老师</a-option>
            <a-option :value="3">学生</a-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
    <a-modal title="编辑&查看用户信息"
             @ok="modalHandleChangeUserInfoOk"
             :visible="modalChangeUserInfoVisible" @cancel="modalChangeUserInfoVisible = false">
      <a-form :model="modalChangeUserInfoForm">
        <a-form-item field="userName" label="用户名">
          <span>{{ modalChangeUserInfoForm.userName }}</span>
        </a-form-item>
        <a-form-item field="nickName" label="昵称">
          <a-input v-model="modalChangeUserInfoForm.nickName" allow-clear />
        </a-form-item>
        <a-form-item field="sex" label="性别">
          <a-select v-model="modalChangeUserInfoForm.sex">
            <a-option :value="0">男</a-option>
            <a-option :value="1">女</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="phone" label="手机号">
          <a-input v-model="modalChangeUserInfoForm.phone" />
        </a-form-item>
        <a-form-item field="className" label="班级">
          <a-select
            v-model="modalChangeUserInfoForm.classId"
            placeholder="请选择用户班级"
            @focus="fetchClassList"
            :loading="classLoading"
            :options="classIdOptions" />
        </a-form-item>
        <a-form-item field="school" label="学校">
          <a-input v-model="modalChangeUserInfoForm.school" placeholder="未填写学校" allow-clear />
        </a-form-item>
        <a-form-item field="description" label="自我介绍">
          <a-textarea v-model="modalChangeUserInfoForm.description"
                      show-word-limit
                      :max-length="400"
                      placeholder="未填写自我介绍" allow-clear />
        </a-form-item>
        <a-form-item field="createDate" label="创建时间">
          <span>
            <a-tag color="#00b42a">
              <template #icon>
                <icon-moon style="color: #fff" />
              </template>
              {{ modalChangeUserInfoForm.createDate }}
            </a-tag>
          </span>
        </a-form-item>
        <a-form-item field="lastLoginDate" label="最后登录时间">
          <a-tag color="#7816ff">
            <template #icon>
              <icon-moon style="color: #fff" />
            </template>
            {{ modalChangeUserInfoForm.lastLoginDate != null ? modalChangeUserInfoForm.lastLoginDate : "从未登录" }}
          </a-tag>
        </a-form-item>
      </a-form>
    </a-modal>


  </div>


</template>

<script lang="ts" setup>
import { computed, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import useLoading from "@/hooks/loading";
import { Options, Pagination } from "@/types/global";
import {
  addNewUser,
  changeRole,
  changeUserInfo,
  ChangeUserRequestDto,
  ClassRecord,
  NewUserRequestDto,
  queryClassList,
  queryRoleList,
  queryUserDetailByQuery,
  QueryUserParams,
  RoleRecord,
  UserRecord
} from "@/api/user-manager";
import _ from "lodash";
import { Message } from "@arco-design/web-vue";
import { HttpResponse } from "@/api/interceptor";

const generateFormModel = () => {
  return {
    id: "",
    userName: "",
    roleId: "",
    phone: "",
    nickName: "",
    sex: "",
    school: "",
    description: "",
    classId: "",
    createDate: "",
    lastLoginDate: ""
  };
};
const { loading, setLoading } = useLoading(true);
const { t } = useI18n();
const renderData = ref<UserRecord[]>([]);
const formModel = ref(generateFormModel());
const basePagination: Pagination = {
  current: 1,
  pageSize: 10,
  total: 0
};
const pagination = reactive({
  ...basePagination
});
const classListData = ref<ClassRecord[]>([]);
const roleListData = ref<RoleRecord[]>([]);

const classIdOptions = computed<Options[]>(() => {
  return classListData.value.map((val) => {
    return {
      label: val.className,
      value: val.id
    };
  });
});
const roleOptions = computed<Options[]>(() => {
  return roleListData.value.map(val => {
    return {
      label: val.roleName,
      value: val.id
    };
  });
});
const sexOptions: Options[] = [
  {
    label: "男",
    value: 0
  },
  {
    label: "女",
    value: 1
  }
];


/**
 * 新建用户模态框
 */
const modalNewUserVisible = ref<boolean>(false);
const modalNewUserOkLoading = ref<boolean>(false);

const modalNewUserForm = ref<Partial<NewUserRequestDto>>({});
// 新建用户关闭模态框
const modalHandleCancel = () => {
  modalNewUserForm.value = {};
  modalNewUserVisible.value = false;
};
const modalHandleOk = () => {
  if (_.isNil(modalNewUserForm.value.userName) && _.isNil(modalNewUserForm.value.passWord)) {
    Message.error("用户名与密码不能为空，请检查后重新提交");
    return;
  } else if (_.isNil(modalNewUserForm.value.phone)) {
    Message.error("手机号不能为空，请检查后重新提交");
    return;
  } else {
    // 请求后端进行添加用户
    fetchAddUser(modalNewUserForm.value as NewUserRequestDto);

  }
};
// 添加用户请求
const fetchAddUser = async (dto: NewUserRequestDto) => {
  modalNewUserOkLoading.value = true; // 开启ok加载动画
  try {
    let { code } = await addNewUser(dto) as any as HttpResponse;
    if (code === 200) {
      Message.success("添加用户成功");
      // 关闭模态框
      modalNewUserVisible.value = false;
      // 重新进行请求列表数据
      await fetchData();
    }
  } catch (e) {
    console.log(e);
  } finally {
    modalNewUserOkLoading.value = false; // 关闭动画
  }
};


// 编辑权限
const modalChangeRoleVisible = ref<boolean>(false);
const modalChangeRoleOkLoading = ref<boolean>(false);
const modalChangeRoleForm = ref<Partial<{
  userName: string,
  roleId: number
}>>({});
const openModalChangeRole = (record: UserRecord) => {
  modalChangeRoleVisible.value = true;
  modalChangeRoleForm.value.roleId = record.roleName === "学生" ? 3 : 2;
  modalChangeRoleForm.value.userName = record.userName;

};
const fetchChangeRole = async (userName: string, roleId: number) => {
  modalChangeRoleOkLoading.value = true;
  try {
    const { code } = await changeRole(userName, roleId) as any as HttpResponse;
    if (code === 200) {
      Message.success("修改权限成功");
      // 关闭模态框
      modalChangeRoleVisible.value = false;
      // 重新请求列表数据
      await fetchData();
    }
  } catch (e) {

  } finally {
    modalChangeRoleOkLoading.value = false;
  }
};


// 编辑信息
const modalChangeUserInfoVisible = ref<boolean>(false);
const modalChangeUserInfoForm = ref<Partial<UserRecord>>({});
const modalChangeUserInfoOkLoading = ref<boolean>(false);
const openModalChangeUserInfo = async (record: UserRecord) => {
  modalChangeUserInfoVisible.value = true;
  modalChangeUserInfoForm.value = record;
  // 对用户班级数据绑定进行处理
  await fetchClassList();
  modalChangeUserInfoForm.value.classId = _.find(classIdOptions.value, { label: record.className })?.value as number;
  console.log(modalChangeUserInfoForm.value.classId);
};
const modalHandleChangeUserInfoOk = () => {

  if (_.isNil(modalChangeUserInfoForm.value.phone)) {
    Message.error("手机号不能为空");
    return;
  }
  const dto: ChangeUserRequestDto = modalChangeUserInfoForm.value as ChangeUserRequestDto;

  fetchChangeUserInfo(dto);
};

const fetchChangeUserInfo = async (dto: ChangeUserRequestDto) => {
  modalChangeUserInfoOkLoading.value = true; // 开始加载动画
  try {
    const { code } = await changeUserInfo(dto) as any as HttpResponse;
    if (code === 200) {
      Message.success("修改用户信息成功");
      // 关闭模态框
      modalChangeUserInfoVisible.value = false;
      // 重新加载列表数据
      await fetchData();
    }
  } catch (e) {


  } finally {
    modalChangeUserInfoOkLoading.value = false; // 结束加载动画
  }

};


// 列表数据
const fetchData = async (
  params: QueryUserParams = { page: 1, size: 20 }
) => {
  setLoading(true);
  try {
    const { data } = await queryUserDetailByQuery(params);
    console.log(data);
    renderData.value = data.list;
    pagination.current = params.page;
    pagination.total = data.total;
  } catch (err) {
    // you can report use errorHandler or other
  } finally {
    setLoading(false);
  }
};

// 请求班级列表信息
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
// 请求角色权限列表信息
const roleLoading = ref<boolean>(false);
const fetchRoleList = async () => {
  roleLoading.value = true;
  try {
    const { data } = await queryRoleList();
    roleListData.value = data;
  } catch (err) {

  } finally {
    roleLoading.value = false;
  }
};

// 创建时间日期选择
const handleCreateDatePicker = (value: string, date: string, dateString: string)=>{
  console.log(value);
  console.log(date);
  console.log(dateString);
}



// 搜索
const search = () => {
  fetchData({
    ...formModel.value,
    page: basePagination.current,
    size: basePagination.pageSize,

  } as unknown as QueryUserParams);
};
const onPageChange = (current: number) => {
  fetchData({
    ...basePagination, page: current, size: basePagination.pageSize,
    ...formModel.value
  } as unknown as QueryUserParams);
};
// 请求列表数据
fetchData();

const reset = () => {
  formModel.value = generateFormModel();
};
</script>

<style scoped lang="less">
.container {
  padding: 0 20px 20px 20px;
}

.pointer-cur {
  cursor: pointer;
}

:deep(.arco-table-th) {
  &:last-child {
    .arco-table-th-item-title {
      margin-left: 16px;
    }
  }
}
</style>
