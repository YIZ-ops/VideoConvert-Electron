# VideoConvert 视频转换工具 Demo

An Electron application with Vue and TypeScript

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin)

## Project

### Create

```bash
npm create @quick-start/electron my-app
cd my-app
```

### Install

```bash
$ npm install
```

### Development

```bash
$ npm run dev
```

### Build

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```

## 组件库

[Ant Design of Vue - Ant Design Vue (antdv.com)](https://antdv.com/docs/vue/introduce-cn)

```shell
npm install ant-design-vue@4.x --save
```

## 解决无法访问本地视频的问题：

```ts
// main/index.ts
webPreferences: {
  webSecurity: false;
}
```

```html
// render/index.html
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; 
  media-src 'self' file:;img-src 'self' data:"
/>
```

## ffmpeg

下载：[ffmpeg-N-116557-g1b8d95da3a-win64-gpl.zip](https://github.com/BtbN/FFmpeg-Builds/releases/download/autobuild-2024-08-10-14-15/ffmpeg-N-116557-g1b8d95da3a-win64-gpl.zip)
配置环境变量：用户变量 Path：`D:\Software\ffmpeg\bin`
验证：`ffmpeg –version`

主进程调用 ffmpeg 处理视频：

```ts
// main/ipc.ts
import process from "child_process";
const command = `ffmpeg -i ${filePath} -an -filter:v "setpts=${speed}*PTS" ${newFilePath}`;
return new Promise((resolve, reject) => {
  process.exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error processing video: ${stderr}`);
      reject(stderr);
    } else {
      resolve(newFilePath);
    }
  });
});
```

文件名字不能有空格：

```bash
ffmpeg -i C:\Users\14798\Desktop\f7ff4fe4-1346-47bb-9466-3f4662c1ac3a.mp4 -an -filter:v "setpts=0.5*PTS" C:\Users\14798\Desktop\output.mp4
```

渲染进程调用并等待完成后通知：

```ts
// VideoHandle.vue
const submit = async () => {
  isProcessing.value = true;
  const newFilePath = await api.processVideo(filePath.value, formState.speed, formState.format);
  openNotification(newFilePath);
  isProcessing.value = false;
};

const openNotification = (description: string) => {
  // 系统通知
  const NOTIFICATION_TITLE = "文件处理完成";
  const NOTIFICATION_BODY = `保存路径：${description}`;
  new Notification(NOTIFICATION_TITLE, { body: NOTIFICATION_BODY });
};
```

### fluent-ffmpeg

[fluent-ffmpeg - npm (npmjs.com)](https://www.npmjs.com/package/fluent-ffmpeg)

```shell
npm install fluent-ffmpeg
```

```ts
// main/ipc.ts
import ffmpeg from "fluent-ffmpeg";
ffmpeg(filePath)
  //   .setFfmpegPath("D:/Software/ffmpeg/bin/ffmpeg.exe") // ffmpeg 路径 配了环境变量(不好使重启) 可以不用写
  .outputOptions(["-vf", `setpts=${speed}*PTS`])
  .save(newFilePath);
```
