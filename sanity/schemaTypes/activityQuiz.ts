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
      name: 'options',
      title: 'الخيارات (عربي) - اكتب 4 خيارات',
      type: 'array',
      of: [{ type: 'string' }],
      validation: (Rule: any) => Rule.required().length(4),
    },
    {
      name: 'optionsEn',
      title: 'الخيارات (إنجليزي) - اكتب 4 خيارات بنفس الترتيب',
      type: 'array',
      of: [{ type: 'string' }],
      validation: (Rule: any) => Rule.required().length(4),
    },
    {
      name: 'correctAnswerIndex',
      title: 'رقم الإجابة الصحيحة (من 0 إلى 3)',
      description: 'مثلاً: إذا كانت الإجابة الصحيحة هي الخيار الأول اكتب 0، وإذا كانت الثاني اكتب 1، وهكذا.',
      type: 'number',
      validation: (Rule: any) => Rule.required().min(0).max(3),
    }
  ]
}