<template>
  <a-button type="primary" size="large" style="width: 100%; margin-bottom: 10px" @click="chooseVideo" :disabled="isProcessing">
    <template #icon>
      <PlusSquareOutlined />
    </template>
    选择视频
  </a-button>
  <div v-if="videoShow" class="video-container">
    <span>当前选择视频：{{ filePath }}</span>
    <video width="100%" controls :src="videoUrl">不支持播放该视频</video>
  </div>

  <div class="params">
    <a-form :model="formState" name="basic" :label-col="{ span: 24 }">
      <a-form-item label="视频倍速" name="speed">
        <a-slider v-model:value="formState.speed" :min="0.5" :max="5" :step="0.25" />
      </a-form-item>
      <a-form-item label="视频格式" name="format">
        <a-select v-model:value="formState.format">
          <a-select-option v-for="(item, index) in videoFormat" :key="index" :value="item">
            {{ item }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <div style="text-align: right">
        <a-button type="primary" @click="submit" :loading="isProcessing"> 提交 </a-button>
      </div>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { PlusSquareOutlined, SmileOutlined } from "@ant-design/icons-vue";
import { notification } from "ant-design-vue";
import { reactive, ref, h } from "vue";
interface FormState {
  speed: number;
  format: string;
}
const formState = reactive<FormState>({
  speed: 1,
  format: "mp4",
});

const videoFormat = ["mp4", "mkv", "avi", "wmv"];
const filePath = ref<string>("");
const videoUrl = ref<string>("");
const videoShow = ref<boolean>(false);
const isProcessing = ref<boolean>(false);

const openNotification = (description: string) => {
  const NOTIFICATION_TITLE = "文件处理完成";
  const NOTIFICATION_BODY = `保存路径：${description}`;
  notification.open({
    message: NOTIFICATION_TITLE,
    description: NOTIFICATION_BODY,
    icon: () => h(SmileOutlined, { style: "color: #108ee9" }),
  });
  // 系统通知
  new Notification(NOTIFICATION_TITLE, { body: NOTIFICATION_BODY });
};

const chooseVideo = async () => {
  const chosenPath = await api.openDialog();
  if (chosenPath) {
    filePath.value = chosenPath;
    videoUrl.value = `file://${filePath.value}`;
    videoShow.value = true;
  }
};

const submit = async () => {
  isProcessing.value = true;
  const newFilePath = await api.processVideo(filePath.value, formState.speed, formState.format);
  openNotification(newFilePath);
  isProcessing.value = false;
  reset();
};

const reset = () => {
  formState.speed = 1;
  formState.format = "mp4";
};
</script>

<style lang="scss" scoped>
.video-container {
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 20px;
  box-shadow: 0 0 10px #ccc;
  margin-top: 5px;
  span {
    font-size: 14px;
    display: block;
    margin-bottom: 5px;
  }
}
.params {
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 20px;
  box-shadow: 0 0 10px #ccc;
  margin-top: 10px;
}
</style>
