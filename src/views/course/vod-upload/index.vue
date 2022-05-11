<template>
  <a-spin :loading="screenLoading" :tip="loadingTip" style="display: block">
    <div class="container">
      <Breadcrumb :items="['menu.course', 'menu.vodUpload']" />
      <a-card class="general-card" :title="$t('menu.vodUpload')">
        <a-row style="margin-bottom: 16px">
          <a-col :span="16">
            <a-space>
              <a-button type="primary" :loading="uploadLoading" @click="uploadClick">
                <template #icon>
                  <icon-plus />
                </template>
                上传视频
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

        <form ref="vod">
          <input type="file" style="display:none;" ref="vodFile" @change="vExampleUpload" />
        </form>

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
              title="云点播Id"
              data-index="fileId"
            />

            <a-table-column
              title="视频名称"
              data-index="name" />
            <a-table-column
              title="上传人"
              data-index="nickName" />

            <a-table-column
              title="视频类型"
              data-index="type"
            />
            <a-table-column
              title="上传时间"
              data-index="updateDate"
            />
            <a-table-column
              title="文件大小"
              data-index="size">
              <template #cell="{record}">
                {{ _.ceil(record.size / 1024 / 1024, 2) }} MB
              </template>
            </a-table-column>

            <a-table-column
              title="视频时长"
              data-index="duration">
              <template #cell="{record}">
                {{ formatSeconds(record.duration) }}
              </template>

            </a-table-column>



            <a-table-column
              :title="$t('searchTable.columns.operations')"
              data-index="operations"
            >
              <template #cell="{ record }">
                <a-space align="center" direction="vertical">
                  <a :href="record.url" target="_blank">
                    <a-button type="text" size="small">
                      预览视频
                    </a-button>
                  </a>
                  <a-button type="text" size="small" :data-clipboard-text="record.url" class="copy-button">复制地址</a-button>
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
                </a-space>
              </template>
            </a-table-column>
          </template>
        </a-table>


      </a-card>

    </div>
  </a-spin>
</template>

<script lang="ts" setup>
import { reactive, ref } from "vue";
import { getSignature, Knowledge, queryKnowledge, queryVodListByPage, saveVod, Vod } from "@/api/course";
import tcVod from "vod-js-sdk-v6";
import axios from "axios";
import { TcVodFileInfo } from "vod-js-sdk-v6/src/uploader";
import { getUserId } from "@/utils/auth";
import { Message,Notification } from "@arco-design/web-vue";
import useLoading from "@/hooks/loading";
import { Pagination } from "@/types/global";
import { BaseParams } from "@/api/base-model";
import _ from "lodash";
import moment from "moment";
import ClipboardJS from "clipboard";

const { loading, setLoading } = useLoading(true);
const renderData = ref<Vod[]>([]);
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
    const { data } = await queryVodListByPage(params);
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


export interface UploaderInfo {
  videoInfo: TcVodFileInfo,
  isVideoUploadSuccess: boolean,
  isVideoUploadCancel: boolean,
  progress: number,
  fileId: string,
  videoUrl: string
}

const uploaderInfo = ref<Partial<UploaderInfo>>({
  progress: 0
});


const vod = ref<HTMLFormElement>();
const vodFile = ref<HTMLInputElement>();

const screenLoading = ref(false);
const loadingTip = ref("正在获取上传许可签名");
const signature = ref();
const uploadLoading = ref(false); // 上传loading

const tcVodInstance = new tcVod({ getSignature: () => new Promise<string>(resolve => resolve(signature.value)) });

const fetchSignature = async () => {
  loading.value = true;
  try {
    const { data } = await getSignature();
    signature.value = data;
  } finally {
    loading.value = false;
  }
};

const uploadClick = async () => {
  await fetchSignature();
  vodFile.value.click();

};
const vExampleUpload = () => {
  uploadLoading.value = true;
  const mediaFile = vodFile.value.files[0];
  const uploader = tcVodInstance.upload({
    mediaFile: mediaFile
  });
  /*  const uploaderInfo = reactive({
      videoInfo: uploader.videoInfo,
      isVideoUploadSuccess: false,
      isVideoUploadCancel: false,
      progress: 0,
      fileId: '',
      videoUrl: ''
    } as UploaderInfo)*/
  uploaderInfo.value.videoInfo = uploader.videoInfo;
  uploaderInfo.value.isVideoUploadSuccess = false;
  uploaderInfo.value.progress = 0;

  uploader.on("media_progress", function(info) {
    uploaderInfo.value.progress = info.percent;
    console.log(info.percent);
  });
  uploader.on("media_upload", function(info) {
    uploaderInfo.value.isVideoUploadSuccess = true;
  });

  uploader.done().then(async doneResult => {
    console.log("上传完成", doneResult);

    uploaderInfo.value.fileId = doneResult.fileId;
    uploaderInfo.value.videoUrl = doneResult.video.url;
    const data = await saveVod({ fileId: uploaderInfo.value.fileId, userId: getUserId() });
    Message.success(data.message);
    await fetchData();
    uploadLoading.value = false;
    vod.value.reset();
  });

};

// 复制url到剪贴板
const clipboard = new ClipboardJS('.copy-button');
clipboard.on('success', e => {
  Notification.success("已复制视频链接到剪贴板");
  // 释放内存
  clipboard.destroy()
})

clipboard.on('error', e => {
  // 不支持复制
  console.log('该浏览器不支持自动复制')
  // 释放内存
  clipboard.destroy()
})

const formatSeconds = (seconds: number) => {
  let hh;
  let mm;
  let ss;
  //传入的时间为空或小于0
  if (seconds == null || seconds < 0) {
    return;
  }
  //得到小时
  hh = seconds / 3600 | 0;
  seconds = seconds - hh * 3600;
  if (parseInt(hh) < 10) {
    hh = "0" + hh;
  }
  //得到分
  mm = seconds / 60 | 0;
  //得到秒
  ss = Math.floor(seconds - mm * 60);
  if (parseInt(mm) < 10) {
    mm = "0" + mm;
  }
  if (ss < 10) {
    ss = "0" + ss;
  }
  return hh + ":" + mm + ":" + ss;

};


</script>

<style scoped lang="less">
.container {
  padding: 0 20px 20px 20px;

  .general-card {
    min-height: 400px;
  }
}


:deep(.arco-table-th) {
  &:last-child {
    .arco-table-th-item-title {
      margin-left: 16px;
    }
  }
}

a {
  display: flex;
  align-items: center;
  text-decoration: none;
  font-size: 14px;
  color: rgb(var(--primary-6));
  transition: .15s linear;
  -webkit-transition: .15s linear;

  &:hover {
    color: rgba(var(--primary-6), .6);;
  }
}
</style>
