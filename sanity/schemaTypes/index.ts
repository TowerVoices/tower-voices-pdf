import { type SchemaTypeDefinition } from 'sanity'
import work from './work' // ملف الروايات الموجود حالياً
import comment from './comment' // استدعاء ملف التعليقات الجديد
import activityCharacter from './activityCharacter' // استدعاء ملف شخصيات الفعاليات الجديد
import activityReward from './activityReward' // استدعاء ملف المكافآت الجديد (البطاقات)

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    work, 
    comment, 
    activityCharacter,
    activityReward // إضافة المكافآت هنا هو ما سيجعله يظهر في قائمة الاستوديو
  ], 
}