import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'work',
  title: 'الأعمال (الروايات)',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'عنوان العمل', type: 'string' }),
    defineField({ name: 'slug', title: 'الرابط (Slug)', type: 'slug', options: { source: 'title' } }),
    
    defineField({ 
      name: 'priority', 
      title: 'الأولوية (للترتيب في الرئيسية)', 
      type: 'number',
      initialValue: 99,
      description: 'ضع رقم 1 للعمل الذي تريده أن يظهر أولاً، ثم 2 للذي يليه، وهكذا.'
    }),

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
    
    /* --------------------------------------------------------- */
    /* الحقول الخاصة بالملفات والروابط */
    
    defineField({ 
      name: 'downloadUrl', 
      title: 'رابط التحميل (Drive)', 
      type: 'url',
      description: 'هذا الرابط مخصص لزر "تحميل PDF" التقليدي ويفتح في صفحة قوقل درايف مباشرة.'
    }),

    defineField({ 
      name: 'readerUrl', 
      title: 'رابط القارئ المباشر (Reader URL)', 
      type: 'url',
      description: 'انسخ رابط Drive العادي هنا (الذي ينتهي بـ /view). سيقوم الموقع تلقائياً بمعالجته عبر "الجسر البرمي" ليعمل داخل القارئ دون أخطاء.'
    }),

    defineField({
      name: 'pdfFile',
      title: 'ملف PDF (رفع مباشر)',
      type: 'file',
      options: { accept: '.pdf' },
      description: 'إذا واجهت مشكلة في روابط Drive، يمكنك رفع الملف مباشرة هنا كخيار بديل ومضمون.'
    }),
  ]
})