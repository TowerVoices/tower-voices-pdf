// schemas/gameSettings.ts
export default {
  name: 'gameSettings',
  title: 'إعدادات اللعبة',
  type: 'document',
  fields: [
    {
      name: 'larpMonsterImage',
      title: 'صورة وحش اللارب (Larp Monster)',
      type: 'image',
      description: 'هذه الصورة ستظهر للاعب عندما يخسر (يصل إلى 15 خطأ)',
      options: {
        hotspot: true,
      },
    },
  ],
}