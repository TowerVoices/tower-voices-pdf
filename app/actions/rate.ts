"use server";
import { createClient } from "next-sanity";

const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_WRITE_TOKEN, // يستخدم مفتاح الكتابة
  useCdn: false,
});

export async function submitRating(workId: string, newRate: number) {
  try {
    const work = await writeClient.getDocument(workId);
    const oldCount = work?.ratingCount || 0;
    const oldAverage = work?.ratingWork || 0;

    // معادلة حساب المتوسط الجديد
    const newCount = oldCount + 1;
    const newAverage = Number(((oldAverage * oldCount + newRate) / newCount).toFixed(1));

    await writeClient
      .patch(workId)
      .set({ ratingWork: newAverage, ratingCount: newCount })
      .commit();

    return { success: true, newAverage };
  } catch (error) {
    console.error("خطأ في الحفظ:", error);
    return { success: false };
  }
}