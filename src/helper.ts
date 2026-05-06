import fs from 'fs/promises'
import { lookup } from 'mime-types'
export async function convertMessages( messages:  { role: string; content: string, imagePath?: string}[]) {
  const convertedMessages = []
  for (const message of messages) {
    let convertedContent: string | any[]
    if (message.imagePath) {
      // 读取持久化后的图片文件并转为 Base64 编码
      const imageBuffer = await fs.readFile(message.imagePath)
      const base64Image = imageBuffer.toString('base64')
      // 获取文件MIME类型
      const mimeType = lookup(message.imagePath)
      // 构建符合 OpenAI 规范的多模态 content 数组
      convertedContent = [
        {
          type: "text",
          text: message.content || ""
        },
        {
          type: 'image_url',
          image_url: {
            url: `data:${mimeType};base64,${base64Image}`
          }
        }
      ]
    } else {
      convertedContent = message.content
    }
    const { imagePath, ...messageWithoutImagePath } = message
    convertedMessages.push({
      ...messageWithoutImagePath,
      content: convertedContent
    })
  }
  return convertedMessages
}


