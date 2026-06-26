import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'activityReward',
  title: 'مكافآت الفعاليات (البطاقات)',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'اسم البطاقة (عربي)',
      type: 'string',
    }),
    // 🔥 الحقل الجديد: اسم البطاقة بالإنجليزية
    defineField({
      name: 'nameEn',
      title: 'اسم البطاقة (English)',
      type: 'string',
    }),
    defineField({
      name: 'image',
      title: 'صورة البطاقة',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'rarity',
      title: 'الندرة',
      type: 'string',
      options: {
        list: [
          { title: 'عادي (Common)', value: 'common' },
          { title: 'نادر (Rare)', value: 'rare' },
          { title: 'أسطوري (Legendary)', value: 'legendary' }
        ],
        layout: 'radio', // لتظهر كخيارات أزرار
      },
      description: 'حدد ندرة هذه البطاقة / Select the rarity of this card',
    })
  ],
})