"use client";
import { useState } from "react";
// تم تصحيح المسار أدناه ليتعرف عليه المحرر والمتصفح بشكل مباشر
import { postComment } from "../app/actions/comment";

export default function CommentForm({ workId }: { workId: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(formData: FormData) {
    setStatus("loading");
    const result = await postComment(formData);
    
    if (result.success) {
      setStatus("success");
      const form = document.getElementById("comment-form") as HTMLFormElement;
      if (form) form.reset();
    } else {
      setStatus("error");
    }
  }

  return (
    <form id="comment-form" action={handleSubmit} className="space-y-4 bg-white/5 p-6 rounded-3xl border border-white/10">
      <h3 className="text-xl font-bold text-white mb-4">أضف تعليقك</h3>
      
      {/* حقل حماية البوتات (Honeypot) - مخفي تماماً عن البشر */}
      <input type="text" name="hp_field" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

      <input 
        type="text" 
        name="name" 
        placeholder="اسمك" 
        required 
        className="w-full bg-zinc-900 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-blue-500"
      />
      
      <textarea 
        name="content" 
        placeholder="اكتب تعليقك هنا..." 
        required 
        rows={4}
        className="w-full bg-zinc-900 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-blue-500"
      ></textarea>

      <input type="hidden" name="workId" value={workId} />

      <button 
        type="submit" 
        disabled={status === "loading"}
        className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
      >
        {status === "loading" ? "جاري الإرسال..." : "نشر التعليق"}
      </button>

      {status === "success" && <p className="text-green-500 text-sm">تم نشر تعليقك بنجاح!</p>}
      {status === "error" && <p className="text-red-500 text-sm">حدث خطأ، حاول مجدداً.</p>}
    </form>
  );
}