import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'comment',
  title: 'التعليقات',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'الاسم', type: 'string' }),
    defineField({ name: 'content', title: 'التعليق', type: 'text' }),
    defineField({ 
      name: 'work', 
      title: 'العمل المرتبط', 
      type: 'reference', 
      to: [{ type: 'work' }] 
    }),
    defineField({ 
      name: 'approved', 
      title: 'موافقة؟', 
      type: 'boolean', 
      initialValue: true // سيظهر فوراً، ويمكنك إخفاؤه من الاستوديو
    }),
  ]
})