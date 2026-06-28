import { type SchemaTypeDefinition } from 'sanity'
import work from './work' // ملف الروايات الموجود حالياً
import comment from './comment' // استدعاء ملف التعليقات الجديد
import activityCharacter from './activityCharacter' // استدعاء ملف شخصيات الفعاليات الجديد
import activityReward from './activityReward' // استدعاء ملف المكافآت الجديد (البطاقات)
import gameSettings from './gameSettings' // استدعاء ملف إعدادات اللعبة (وحش اللارب)

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    work, 
    comment, 
    activityCharacter,
    activityReward, 
    gameSettings // إضافته هنا هي ما ستجعله يظهر في القائمة الجانبية
  ], 
}