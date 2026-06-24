import { type SchemaTypeDefinition } from 'sanity'
import work from './work' // ملف الروايات الموجود حالياً
import comment from './comment' // استدعاء ملف التعليقات الجديد
import activityCharacter from './activityCharacter' // استدعاء ملف شخصيات الفعاليات الجديد

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    work, 
    comment, 
    activityCharacter // إضافة activityCharacter هنا هو ما سيجعله يظهر في القائمة
  ], 
}