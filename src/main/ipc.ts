import { ipcMain, dialog } from "electron";
import ffmpeg from "fluent-ffmpeg";
import process from "child_process";
export function initIpc() {
  // 选择视频
  ipcMain.handle("open-dialog", async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ["openFile"],
      filters: [{ name: "Videos", extensions: ["mp4", "mkv", "avi", "wmv"] }],
    });
    return filePaths[0] ? filePaths[0] : "";
  });

  // 处理视频
  ipcMain.handle("process-video", async (_, filePath: string, speed: number, format: string) => {
    const dir = filePath.substring(0, filePath.lastIndexOf("\\"));
    const fileName = filePath.substring(filePath.lastIndexOf("\\") + 1, filePath.lastIndexOf("."));
    const newFilePath = `${dir}/${fileName}-output-${speed}x-${format}.${format}`;
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
    // ffmpeg(filePath)
    //   //   .setFfmpegPath("D:/Software/ffmpeg/bin/ffmpeg.exe") // ffmpeg 路径 配了环境变量 可以不用写
    //   .outputOptions(["-vf", `setpts=${speed}*PTS`])
    //   .save(newFilePath);
  });
}
