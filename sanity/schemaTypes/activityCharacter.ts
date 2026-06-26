import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'activityCharacter',
  title: 'شخصيات الفعاليات', // الاسم الذي سيظهر لك في الاستوديو
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'اسم الشخصية (عربي)',
      type: 'string',
    }),
    // 🔥 الحقل الجديد: الاسم بالإنجليزية
    defineField({
      name: 'nameEn',
      title: 'اسم الشخصية (English)',
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
    defineField({
      name: 'infoTexts',
      title: 'معلومات الشخصية (عربي)',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'أضف عدة معلومات هنا بالضغط على (Add item). اللعبة ستختار واحدة منها عشوائياً في كل جولة لكي لا تتكرر.',
    }),
    // 🔥 الحقل الجديد: المعلومات بالإنجليزية
    defineField({
      name: 'infoTextsEn',
      title: 'معلومات الشخصية (English)',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Add multiple info texts here. The game will pick one randomly. (أضف المعلومات باللغة الإنجليزية هنا)',
    }),
    defineField({
      name: 'hints',
      title: 'تلميحات (عربي) - للعبة خمن الشخصية',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'أضف التلميحات بالترتيب (من الأصعب للأسهل)',
    }),
    // 🔥 الحقل الجديد: التلميحات بالإنجليزية
    defineField({
      name: 'hintsEn',
      title: 'تلميحات (English) - للعبة خمن الشخصية',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Add hints in order from hardest to easiest. (أضف التلميحات الإنجليزية بالترتيب)',
    })
  ],
})