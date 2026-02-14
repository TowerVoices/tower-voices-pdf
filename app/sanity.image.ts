import createImageUrlBuilder from '@sanity/image-url'
import { client } from './sanity.client'

const builder = createImageUrlBuilder(client)

export const urlFor = (source: any) => {
  return builder.image(source)
    .auto('format') // يحول الصورة تلقائياً لصيغة WebP حسب دعم المتصفح
    .quality(75)    // يقلل الجودة لـ 75% لخفض الحجم بشكل كبير دون فقدان الوضوح
}