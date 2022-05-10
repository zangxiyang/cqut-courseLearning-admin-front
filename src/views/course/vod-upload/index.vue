<template>
  <a-spin :loading="loading" :tip="loadingTip" style="display: block">
    <div class="container">
      <Breadcrumb :items="['menu.course', 'menu.vodUpload']" />
      <a-card class="general-card" :title="$t('menu.vodUpload')">
        <a-row style="margin-bottom: 16px">
          <a-col :span="16">
            <a-space>
              <a-button type="primary" @click="uploadClick">
                <template #icon>
                  <icon-plus />
                </template>
                上传视频
              </a-button>

            </a-space>
          </a-col>
        </a-row>

        <form ref="vExample">
          <input type="file" style="display:none;" ref="vExampleFile" @change="vExampleUpload" />
        </form>
        <form ref="vcExample">
          <input type="file" style="display:none;" ref="vcExampleVideo" @change="setVcExampleVideoName()" />
        </form>
        <div class="row" id="resultBox">
          <!-- 上传信息组件	 -->
          <div class="uploaderMsgBox" v-for="uploaderInfo in uploaderInfos">
            <div v-if="uploaderInfo.videoInfo">
              视频名称：{{ uploaderInfo.videoInfo.name + "." + uploaderInfo.videoInfo.type }}；
              上传进度：{{ Math.floor(uploaderInfo.progress * 100) + "%" }}；
              fileId：{{ uploaderInfo.fileId }}；
              上传结果：{{ uploaderInfo.isVideoUploadCancel ? "已取消" : uploaderInfo.isVideoUploadSuccess ? "上传成功" : "上传中" }}；
              <br>
              地址：{{ uploaderInfo.videoUrl }}；
              <a href="javascript:void(0);" class="cancel-upload"
                 v-if="!uploaderInfo.isVideoUploadSuccess && !uploaderInfo.isVideoUploadCancel"
                 @click="uploaderInfo.cancel()">取消上传</a><br>
            </div>
          </div>
        </div>

      </a-card>

    </div>
  </a-spin>
</template>

<script lang="ts" setup>
import { reactive, ref } from "vue";
import { getSignature } from "@/api/course";
import tcVod from 'vod-js-sdk-v6'
import axios from "axios";
import { TcVodFileInfo } from "vod-js-sdk-v6/src/uploader";

export interface UploaderInfo {
  videoInfo: TcVodFileInfo,
  isVideoUploadSuccess: boolean,
  isVideoUploadCancel: boolean,
  progress: number,
  fileId: string,
  videoUrl: string
}

const uploaderInfos = ref<UploaderInfo[]>([]);

const vcExampleVideoName = ref();

const vExample = ref<HTMLFormElement>();
const vExampleFile = ref<HTMLInputElement>();

const loading = ref(false);
const loadingTip = ref("正在获取上传许可签名");
const signature = ref();

const tcVodInstance = new tcVod({getSignature: ()=> new Promise<string>(resolve => resolve(signature.value))})

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
  vExampleFile.value.click();

};
const vExampleUpload = ()=>{
  const mediaFile = vExampleFile.value.files[0];
  const uploader = tcVodInstance.upload({
    mediaFile: mediaFile,
  });
  const uploaderInfo = reactive({
    videoInfo: uploader.videoInfo,
    isVideoUploadSuccess: false,
    isVideoUploadCancel: false,
    progress: 0,
    fileId: '',
    videoUrl: '',
    cancel: function() {
      uploaderInfo.isVideoUploadCancel = true;
      uploader.cancel()
    }
  } as UploaderInfo)

  uploader.on('media_progress', function (info) {
    uploaderInfo.progress = info.percent;
  })
  uploader.on('media_upload', function (info) {
    uploaderInfo.isVideoUploadSuccess = true;
  })


  uploader.done().then(function(doneResult) {
    console.log('上传完成', doneResult)

    uploaderInfo.fileId = doneResult.fileId;
    uploaderInfo.videoUrl = doneResult.video.url;
    vExample.value.reset();
    uploaderInfos.value.push(uploaderInfo);
  })

}


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
