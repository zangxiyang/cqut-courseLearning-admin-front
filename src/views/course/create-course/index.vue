<template>
  <div class="container">
    <Breadcrumb :items="['menu.course', 'menu.createCourse']" />
    <a-spin :loading="loading" style="width: 100%">
      <a-card class="general-card">
        <template #title>
          {{ $t("menu.createCourse") }}
        </template>
        <div class="wrapper">
          <a-steps
            v-model:current="step"
            style="width: 580px"
            line-less
            class="steps"
          >
            <a-step description="该课程的基本信息">
              创建课程信息
            </a-step>
            <a-step description="该课程的章节目录">
              创建章节目录
            </a-step>
            <a-step description="完成课程创建">
              完成创建
            </a-step>
          </a-steps>
          <keep-alive>
            <BaseInfo v-if="step === 1" @change-step="changeStep" v-model:clear="clearFlag"/>
            <ChapterInfo v-else-if="step === 2" @change-step="changeStep" v-model:clear="clearFlag"/>
            <Success v-else-if="step === 3" @change-step="changeStep" />
          </keep-alive>
        </div>
      </a-card>
    </a-spin>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from "vue";
import useLoading from "@/hooks/loading";
import { BaseInfoModel, ChannelInfoModel } from "@/api/form";
import BaseInfo from "./components/base-info.vue";
import ChapterInfo from "./components/chapter-info.vue";
import Success from "./components/success.vue";
import { createCourse, IModelUnitCreateCourse } from "@/api/course";


const { loading, setLoading } = useLoading(false);
const step = ref(1);
const submitModel = ref<IModelUnitCreateCourse>({} as IModelUnitCreateCourse);
const submitForm = async () => {
  setLoading(true);
  try {
    console.log(submitModel.value);
    await createCourse(submitModel.value);
    step.value = 3;
    submitModel.value = {} as IModelUnitCreateCourse
  } catch (err) {
    // you can report use errorHandler or other
    console.log(err);
  } finally {
    setLoading(false);
  }
};
const clearFlag = ref(false);
const changeStep = (
  direction: string | number,
  model: BaseInfoModel | ChannelInfoModel
) => {
  if (direction === 'reCreated'){
    step.value = 1;
    // 清空数据
    clearFlag.value = true;
    return;
  }
  if (typeof direction === "number") {
    step.value = direction;
    return;
  }

  if (direction === "forward" || direction === "submit") {
    submitModel.value = {
      ...submitModel.value,
      ...model
    };
    if (direction === "submit") {
      submitForm();
      return;
    }
    step.value += 1;
  } else if (direction === "backward") {
    step.value -= 1;
  }
};
</script>

<style scoped lang="less">
.container {
  padding: 0 20px 20px 20px;
}

.wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 64px 0;
  background-color: var(--color-bg-2);

  :deep(.arco-form) {
    .arco-form-item {
      &:last-child {
        margin-top: 20px;
      }
    }
  }
}

.steps {
  margin-bottom: 76px;
}
</style>
