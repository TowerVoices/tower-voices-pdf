"use client";
import { useState } from "react";
import { FaStar, FaRegStar } from "react-icons/fa";
import { submitRating } from "@/app/actions/rate"; // استدعاء الأكشن الخاص بالحفظ

interface RatingProps {
  initialRating: number;
  workId: string; // إضافة معرف العمل لضمان الحفظ في المكان الصحيح
}

export default function InteractiveRating({ initialRating, workId }: RatingProps) {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);
  const [voted, setVoted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRating = async (val: number) => {
    if (voted || isLoading) return;

    setIsLoading(true);
    
    // محاولة حفظ التقييم في السيرفر
    const result = await submitRating(workId, val);

    if (result.success) {
      setRating(result.newAverage || val); // تحديث القيمة بالمتوسط الجديد
      setVoted(true);
    } else {
      alert("عذراً، حدث خطأ أثناء حفظ التقييم. يرجى المحاولة لاحقاً.");
    }
    
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-center md:items-start gap-2">
      <div className={`flex gap-1 ${isLoading ? "opacity-50 pointer-events-none" : ""}`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleRating(star)}
            onMouseEnter={() => !voted && setHover(star)}
            onMouseLeave={() => !voted && setHover(0)}
            disabled={voted || isLoading}
            className={`text-2xl transition-all duration-300 ${
              !voted ? "hover:scale-125 active:scale-90 cursor-pointer" : "cursor-default"
            }`}
          >
            {(hover || rating) >= star ? (
              <FaStar className="text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]" />
            ) : (
              <FaRegStar className="text-zinc-600" />
            )}
          </button>
        ))}
      </div>
      
      {isLoading && (
        <span className="text-[9px] text-blue-400 font-medium animate-pulse">جاري الحفظ...</span>
      )}
      
      {voted && !isLoading && (
        <span className="text-[10px] text-green-500 font-bold animate-fade-in">
          ✓ تم حفظ تقييمك بنجاح
        </span>
      )}
    </div>
  );
}