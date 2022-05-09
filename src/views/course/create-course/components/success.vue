<template>
  <div class="success-wrap">
    <a-result
      status="success"
      title="课程创建成功"
      subtitle="课程已被成功创建, 详情请查看前台页面"
    />
    <a-space :size="16">
      <a-button key="view" type="primary">
        {{ $t('stepForm.button.view') }}
      </a-button>
      <a-button key="again" type="secondary" @click="oneMore">
        {{ $t('stepForm.button.again') }}
      </a-button>
    </a-space>
    <div class="details-wrapper">
      <a-typography-title :heading="6" style="margin-top: 0">
        创建课程说明
      </a-typography-title>
      <a-typography-paragraph style="margin-bottom: 0">
        暂时的描述
        <a-link href="link">{{ $t('stepForm.button.view') }}</a-link>
      </a-typography-paragraph>
    </div>
  </div>
</template>

<script lang="ts" setup>
  const emits = defineEmits(['changeStep']);
  const oneMore = () => {
    emits('changeStep', 'reCreated');
  };
</script>

<style scoped lang="less">
  .success-wrap {
    text-align: center;
  }
  :deep(.arco-result) {
    padding-top: 0;
  }
  .details-wrapper {
    width: 895px;
    margin-top: 54px;
    padding: 20px;
    text-align: left;
    background-color: var(--color-fill-2);
  }
</style>
