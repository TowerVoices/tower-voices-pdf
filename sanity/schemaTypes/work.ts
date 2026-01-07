import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'work',
  title: 'الأعمال (الروايات)',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'عنوان العمل', type: 'string' }),
    defineField({ name: 'slug', title: 'الرابط (Slug)', type: 'slug', options: { source: 'title' } }),
    
    // 1. خانة المؤلف الجديدة
    defineField({ 
      name: 'author', 
      title: 'المؤلف', 
      type: 'string',
      description: 'اسم كاتب الرواية الأصلي'
    }),

    defineField({ name: 'cover', title: 'غلاف العمل', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'tags', title: 'الوسوم (التصنيفات)', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'status', title: 'حالة الترجمة', type: 'string' }),
    
    defineField({ name: 'ratingWork', title: 'تقييم القصة', type: 'number' }),
    defineField({ name: 'ratingTranslation', title: 'تقييم الترجمة', type: 'number' }),
    
    // 2. خانة عدد المقيمين الجديدة
    defineField({ 
      name: 'ratingCount', 
      title: 'عدد المقيمين', 
      type: 'number', 
      initialValue: 0,
      description: 'إجمالي عدد الأشخاص الذين قاموا بالتقييم'
    }),

    defineField({ name: 'synopsis', title: 'الملخص', type: 'text' }),
    defineField({ name: 'isSpoiler', title: 'تفعيل إخفاء الحرق (Blur)؟', type: 'boolean', initialValue: false }),
    defineField({ name: 'warning', title: 'نص التحذير (إن وجد)', type: 'string' }),
    defineField({ name: 'downloadUrl', title: 'رابط التحميل (Drive)', type: 'url' }),
  ]
})