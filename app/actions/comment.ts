"use server";
import { createClient } from "next-sanity";
import { revalidatePath } from "next/cache";

const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_WRITE_TOKEN, // مفتاح الكتابة في Vercel
  useCdn: false,
});

export async function postComment(formData: FormData) {
  const hpField = formData.get("hp_field");
  const name = formData.get("name");
  const content = formData.get("content");
  const workId = formData.get("workId");

  // إذا كان الحقل المخفي ممتلئاً، فهذا بوت
  if (hpField) {
    console.log("Bot detected!");
    return { success: false, message: "Bot detected" };
  }

  try {
    await writeClient.create({
      _type: "comment",
      name,
      content,
      work: { _type: "reference", _ref: workId },
      approved: true, // يظهر فوراً وتتحكم به من الاستوديو
    });
    
    revalidatePath(`/works/[slug]`); // تحديث الصفحة لرؤية التعليق الجديد
    return { success: true };
  } catch (err) {
    return { success: false };
  }
}