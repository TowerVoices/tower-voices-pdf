import { defineType, defineField } from 'sanity'
import { FaBook, FaLink, FaImage, FaMapSigns, FaInfoCircle } from 'react-icons/fa'

export default defineType({
  name: 'work',
  title: 'الأعمال (الروايات)',
  type: 'document',
  icon: FaBook,

  // 1. تعريف المجموعات (التبويبات العلوية) لتقليل الازدحام
  groups: [
    { name: 'main', title: 'المعلومات الأساسية', icon: FaInfoCircle },
    { name: 'content', title: 'المحتوى والقصة', icon: FaBook },
    { name: 'media', title: 'الوسائط والأغلفة', icon: FaImage },
    { name: 'links', title: 'الروابط والملفات', icon: FaLink },
    { name: 'navigation', title: 'رحلة البرج (التنقل)', icon: FaMapSigns },
  ],

  fields: [
    /* --- مجموعة: المعلومات الأساسية --- */
    defineField({ name: 'title', title: 'عنوان العمل', type: 'string', group: 'main' }),
    defineField({ name: 'slug', title: 'الرابط (Slug)', type: 'slug', options: { source: 'title' }, group: 'main' }),
    defineField({ 
      name: 'priority', 
      title: 'الأولوية (للترتيب في الرئيسية)', 
      type: 'number',
      initialValue: 99,
      group: 'main',
      description: 'ضع رقم 1 للعمل الذي تريده أن يظهر أولاً.'
    }),
    defineField({ name: 'author', title: 'المؤلف', type: 'string', group: 'main' }),
    defineField({ name: 'status', title: 'حالة الترجمة', type: 'string', group: 'main' }),

    /* --- مجموعة: الوسائط --- */
    defineField({ name: 'cover', title: 'غلاف العمل', type: 'image', options: { hotspot: true }, group: 'media' }),
    defineField({ name: 'tags', title: 'الوسوم (التصنيفات)', type: 'array', of: [{ type: 'string' }], group: 'media' }),

    /* --- مجموعة: المحتوى --- */
    defineField({ name: 'synopsis', title: 'الملخص', type: 'text', group: 'content' }),
    defineField({ name: 'isSpoiler', title: 'تفعيل إخفاء الحرق (Blur)؟', type: 'boolean', initialValue: false, group: 'content' }),
    defineField({ name: 'warning', title: 'نص التحذير (إن وجد)', type: 'string', group: 'content' }),
    defineField({ name: 'ratingWork', title: 'تقييم القصة', type: 'number', group: 'content' }),
    defineField({ name: 'ratingTranslation', title: 'تقييم الترجمة', type: 'number', group: 'content' }),
    defineField({ 
      name: 'ratingCount', 
      title: 'عدد المقيمين', 
      type: 'number', 
      initialValue: 0,
      group: 'content'
    }),

    /* --- مجموعة: الروابط والملفات --- */
    defineField({ name: 'downloadUrl', title: 'رابط التحميل (Drive)', type: 'url', group: 'links' }),
    defineField({ name: 'readerUrl', title: 'رابط القارئ المباشر (Reader URL)', type: 'url', group: 'links' }),
    defineField({
      name: 'pdfFile',
      title: 'ملف PDF (رفع مباشر)',
      type: 'file',
      options: { accept: '.pdf' },
      group: 'links'
    }),

    /* --- مجموعة: رحلة البرج (التنقل والترتيب) --- */
    defineField({
      name: 'previousWork',
      title: 'العمل السابق',
      type: 'reference',
      to: [{type: 'work'}],
      group: 'navigation'
    }),
    defineField({
      name: 'nextWork',
      title: 'العمل التالي (أو تخطي)',
      type: 'reference',
      to: [{type: 'work'}],
      group: 'navigation'
    }),
    defineField({
      name: 'parentVolume',
      title: 'المجلد الأساسي (خاص بالقصص الجانبية)',
      type: 'reference',
      to: [{type: 'work'}],
      group: 'navigation'
    }),
    defineField({
      name: 'chronologicalOrder',
      title: 'الترتيب الزمني (رقم)',
      type: 'number',
      initialValue: 0,
      group: 'navigation'
    }),
    defineField({
      name: 'storyType',
      title: 'نوع المسار (للتصفية)',
      type: 'string',
      group: 'navigation',
      options: {
        list: [
          { title: 'القصة الأساسية (Main)', value: 'main' },
          { title: 'روايات (EX)', value: 'ex' },
          { title: 'مسارات ماذا لو (IF)', value: 'if' },
          { title: 'قصص جانبية (Side)', value: 'side' },
        ],
        layout: 'radio'
      }
    }),
  ],

  // 2. تحسين شكل القائمة الجانبية لعرض الأغلفة والحالة بوضوح
  preview: {
    select: {
      title: 'title',
      author: 'author',
      media: 'cover',
      status: 'status'
    },
    prepare(selection) {
      const {title, author, media, status} = selection
      return {
        title: title,
        subtitle: `${author || 'تابي ناجاتسوكي'} | [${status || 'قيد الترجمة'}]`,
        media: media
      }
    }
  }
})