import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'activityQuiz',
  title: 'أسئلة اختبار المعرفة',
  type: 'document',
  fields: [
    defineField({
      name: 'question',
      title: 'السؤال (عربي)',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'questionEn',
      title: 'السؤال (إنجليزي)',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'questionImage',
      title: 'صورة مرفقة بالسؤال (اختياري)',
      description: 'إذا رفعت صورة هنا، سيظهر السؤال كـ "خمن المشهد/الشخصية".',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'isNovelSpoiler',
      title: 'هل السؤال من الرواية؟ (تحذير حرق ⚠️)',
      description: 'قم بتفعيل هذا الخيار إذا كان السؤال يحتوي على أحداث من الرواية ولم يظهر في الأنمي بعد، لكي يظهر فقط في مستوى "قراء الرواية".',
      type: 'boolean',
      initialValue: false,
    }),
    // 🔥 الخيار الجديد: تحديد أسئلة محنة إيكيدنا السرية
    defineField({
      name: 'isEchidnaTrial',
      title: 'هل السؤال خاص بمحنة إيكيدنا السرية؟ 👁️',
      description: 'قم بتفعيل هذا الخيار لكي يظهر هذا السؤال حصرياً في التحدي السري الأخير (محنة الـ 5 ثوانٍ).',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'options',
      title: 'الخيارات (عربي)',
      type: 'array',
      of: [{ type: 'string' }],
      validation: (Rule) => Rule.required().min(2).max(4),
    }),
    defineField({
      name: 'optionsEn',
      title: 'الخيارات (إنجليزي)',
      type: 'array',
      of: [{ type: 'string' }],
      validation: (Rule) => Rule.required().min(2).max(4),
    }),
    defineField({
      name: 'correctAnswerIndex',
      title: 'رقم الإجابة الصحيحة (يبدأ من 0)',
      type: 'number',
      validation: (Rule) => Rule.required().min(0).max(3),
    })
  ]
})