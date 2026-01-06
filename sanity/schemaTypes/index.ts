import { type SchemaTypeDefinition } from 'sanity'
import work from './work' // استيراد القالب الذي أنشأته

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [work], // إضافة القالب هنا ليظهر في لوحة التحكم
}