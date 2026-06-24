import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'activityCharacter',
  title: 'شخصيات الفعاليات', // الاسم الذي سيظهر لك في الاستوديو
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'اسم الشخصية',
      type: 'string',
    }),
    defineField({
      name: 'image',
      title: 'صورة الشخصية',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'pairId',
      title: 'رقم التطابق (لعبة المطابقة)',
      type: 'number',
      description: 'رقم مميز لربط الشخصية بالمعلومة (مثلاً: 1, 2, 3)',
    }),
    // التعديل هنا: تحويل المعلومة إلى قائمة (Array)
    defineField({
      name: 'infoTexts',
      title: 'معلومات الشخصية (لعبة المطابقة)',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'أضف عدة معلومات هنا بالضغط على (Add item). اللعبة ستختار واحدة منها عشوائياً في كل جولة لكي لا تتكرر.',
    }),
    defineField({
      name: 'hints',
      title: 'تلميحات (لعبة خمن الشخصية)',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'أضف التلميحات بالترتيب (من الأصعب للأسهل)',
    })
  ],
})