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

    // ----------------------------------------------------
    // 🔥 حقول لعبة: خمن الشخصية
    // ----------------------------------------------------

    defineField({
      name: 'hints',
      title: 'تلميحات (عربي) - للعبة خمن الشخصية',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'أضف التلميحات هنا. (ملاحظة: اللعبة ستقوم بخلطها وعرضها بشكل عشوائي للاعب)',
    }),
    // 🔥 الحقل الجديد: التلميحات بالإنجليزية
    defineField({
      name: 'hintsEn',
      title: 'تلميحات (English) - للعبة خمن الشخصية',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Add hints here. (Note: The game will shuffle and display them randomly to the player)',
    }),
    
    // 🔥 حقول مستوى إيكيدنا (الصعب جداً)
    defineField({
      name: 'echidnaHints',
      title: 'تلميحات مستوى إيكيدنا الصعب (عربي)',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'أضف تلميحاً صعباً جداً هنا. سيظهر فقط لمن يختار مستوى إيكيدنا (بدون تلميحات إضافية).',
    }),
    defineField({
      name: 'echidnaHintsEn',
      title: 'تلميحات مستوى إيكيدنا الصعب (English)',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Add a very hard hint here for the Echidna difficulty level (no extra hints).',
    }),
  ],
})