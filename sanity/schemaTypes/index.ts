import { type SchemaTypeDefinition } from 'sanity'
import work from './work' // ملف الروايات الموجود حالياً
import comment from './comment' // استدعاء ملف التعليقات الجديد

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [work, comment], // إضافة comment هنا هو ما سيجعله يظهر في القائمة
}