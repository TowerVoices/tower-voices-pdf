export default {
  name: 'activityQuiz',
  title: 'أسئلة اختبار المعرفة',
  type: 'document',
  fields: [
    {
      name: 'question',
      title: 'السؤال (عربي)',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'questionEn',
      title: 'السؤال (إنجليزي)',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'questionImage',
      title: 'صورة مرفقة بالسؤال (اختياري)',
      description: 'إذا رفعت صورة هنا، سيظهر السؤال كـ "خمن المشهد/الشخصية".',
      type: 'image',
      options: { hotspot: true },
    },
    // 🔥 الإضافة الجديدة: تحذير الحرق
    {
      name: 'isNovelSpoiler',
      title: 'هل السؤال من الرواية؟ (تحذير حرق ⚠️)',
      description: 'قم بتفعيل هذا الخيار إذا كان السؤال يحتوي على أحداث من الرواية ولم يظهر في الأنمي بعد، لكي يظهر فقط في مستوى "قراء الرواية".',
      type: 'boolean',
      initialValue: false,
    },
    {
      name: 'options',
      title: 'الخيارات (عربي)',
      type: 'array',
      of: [{ type: 'string' }],
      validation: (Rule: any) => Rule.required().min(2).max(4),
    },
    {
      name: 'optionsEn',
      title: 'الخيارات (إنجليزي)',
      type: 'array',
      of: [{ type: 'string' }],
      validation: (Rule: any) => Rule.required().min(2).max(4),
    },
    {
      name: 'correctAnswerIndex',
      title: 'رقم الإجابة الصحيحة (يبدأ من 0)',
      type: 'number',
      validation: (Rule: any) => Rule.required().min(0).max(3),
    }
  ]
}