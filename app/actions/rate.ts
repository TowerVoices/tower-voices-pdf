"use server";
import { createClient } from "next-sanity";

const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

// أضفنا fieldName لتحديد هل التحديث للقصة أم للترجمة
export async function submitRating(workId: string, newRate: number, fieldName: 'ratingWork' | 'ratingTranslation') {
  try {
    const work = await writeClient.getDocument(workId);
    
    // نستخدم ratingCount العام حالياً، أو يمكنك مستقبلاً فصلهم
    const oldCount = work?.ratingCount || 0;
    const oldAverage = work?.[fieldName] || 0;

    const newCount = oldCount + 1;
    const newAverage = Number(((oldAverage * oldCount + newRate) / newCount).toFixed(1));

    await writeClient
      .patch(workId)
      .set({ 
        [fieldName]: newAverage, // تحديث الخانة المطلوبة ديناميكياً
        ratingCount: newCount 
      })
      .commit();

    return { success: true, newAverage };
  } catch (error) {
    console.error("خطأ في الحفظ:", error);
    return { success: false };
  }
}