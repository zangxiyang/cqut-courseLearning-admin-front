<template>
  <a-form
    ref="formRef"
    :model="formData"
    class="form"
  >
    <!--:label-col-props="{ span: 6 }"-->
    <!--:wrapper-col-props="{ span: 18 }"-->

    <div class="delContent">
      <a-button
        style="margin-left: 5px"
        size="small"
        @click="handleAddContent"
        type="primary">
        <template #icon>
          <icon-plus />
        </template>
        添加章节
      </a-button>
    </div>
    <template v-for="(item, index) of formData.contents" :key="index">
      <div class="chapter-form-item">
        <a-form-item label="章节名称" :field="`chapterName${index}`">
          <a-input v-model="item.chapterName" placeholder="章节名称"/>
          <a-button
            style="margin-left: 5px"
            @click="handleAddContentNode(index)"
            type="primary">
              <icon-plus />
          </a-button>
          <a-button
            style="margin-left: 5px"
            @click="handleDelContent(index)"
            status="danger"
            type="primary">
            <icon-delete />
          </a-button>
        </a-form-item>
        <a-form-item label="章节描述" :field="`chapterDesc${index}`">
          <a-textarea
            v-model="item.description"
            show-word-limit
            :max-length="500"
            allow-clear
            placeholder="章节描述"/>
        </a-form-item>
        <div class="content-nodes">
          <template v-for="(nodeItem, nodeIndex) of item.nodes" :key="nodeIndex">
            <a-form-item label="节点名称" :field="`chapterNode${nodeIndex}`">
              <a-input v-model="nodeItem.nodeName" placeholder="请输入节点名称"/>
              <a-button
                style="margin-left: 5px"
                @click="handleDelContentNode(index,nodeIndex)"
                status="danger"
                type="primary">
                <icon-delete />
              </a-button>
            </a-form-item>
            <a-form-item class="bottom-line" label="视频地址" :field="`chapterNode${nodeIndex}`">
              <a-input v-model="nodeItem.videoUrl" placeholder="请输入视频地址"/>
            </a-form-item>
          </template>
        </div>
      </div>
    </template>

    <a-form-item>
      <a-space>
        <a-button type="secondary" @click="goPrev">
          {{ $t('stepForm.button.prev') }}
        </a-button>
        <a-button type="primary" @click="onNextClick">
          {{ $t('stepForm.button.next') }}
        </a-button>
      </a-space>
    </a-form-item>
  </a-form>
</template>

<script lang="ts" setup>
import { PropType, ref, watch } from "vue";
  import { FormInstance } from '@arco-design/web-vue/es/form';
  import { IModelChapterInfo } from "@/api/course";

  const props = defineProps({
    clear: Boolean as PropType<boolean>
  })
  const emits = defineEmits(['changeStep','update:clear']);

  watch(()=> props.clear,(val)=>{
    if (val === true){
      clearData();
      emits('update:clear', false);
    }
  })


  const formRef = ref<FormInstance>();
  const formData = ref({
    contents: [
      {
        chapterName: '样例章节',
        description: '该章节需要掌握xxxxxxx',
        nodes: [
          {
            nodeName: '第一节 测试节点1',
            videoUrl: '测试1'
          },
          {
            nodeName: '第二节 测试节点2',
            videoUrl: '测试2'
          },
        ]
      }
    ] as IModelChapterInfo[]
  });


  // 清空数据
  const clearData = ()=>{
    formRef.value.resetFields();
  }

  defineExpose({
    clearData
  })

  // 增加章节
  const handleAddContent = ()=>{
    formData.value.contents.push({
      chapterName: '样例章节',
      description: '该章节需要掌握xxxxxxx',
      nodes: [
        {
          nodeName: '第一节 测试节点1',
          videoUrl: '测试1'
        }
      ]
    });
  }
  // 删除章节
  const handleDelContent = (index: number) =>{
    formData.value.contents.splice(index,1);
    console.log(`${index} 删除成功`);
  }

  // 增加章节节点
  const handleAddContentNode = (index: number)=>{
    formData.value.contents[index].nodes.push({
        nodeName: '第一节 测试节点1',
        videoUrl: '测试1'
      });
  }
  // 删除章节节点
  const handleDelContentNode = (index: number, nodeIndex: number) =>{
    formData.value.contents[index].nodes.splice(nodeIndex,1);
  }


  const onNextClick = async () => {
    const res = await formRef.value?.validate();
    if (!res) {
      emits('changeStep', 'submit', { ...formData.value });
    }
  };
  const goPrev = () => {
    emits('changeStep', 'backward');
  };
</script>

<style scoped lang="less">
  .container {
    .keep-margin {
      margin-bottom: 20px;
    }
  }

  .delContent{
    display: flex;
    justify-content: end;
    padding-bottom: 15px;
  }

  .chapter-form-item{
    padding-top: 20px;
    padding-right: 10px;
    border: 1px dashed rgb(var(--primary-6));
    border-radius: 4px;
    margin-bottom: 5px;
    .content-nodes{
      padding-left: 20px;
    }
    .bottom-line{
      padding-bottom: 10px;
      border-bottom: 1px dashed #dedede;
    }
  }


  .wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 64px 0;
    background-color: var(--color-bg-2);
  }

  .steps {
    margin-bottom: 36px;
  }

  .form {
    width: 540px;
  }

  .form-content {
    padding: 8px 50px 0 30px;
  }
</style>
