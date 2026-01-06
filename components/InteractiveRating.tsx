"use client";
import { useState } from "react";
import { FaStar, FaRegStar } from "react-icons/fa";

export default function InteractiveRating({ initialRating }: { initialRating: number }) {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);
  const [voted, setVoted] = useState(false);

  const handleRating = (val: number) => {
    if (voted) return;
    setRating(val);
    setVoted(true);
    // هنا يمكن إضافة Fetch لإرسال التقييم لقاعدة البيانات لاحقاً
    alert("شكراً لتقييمك!");
  };

  return (
    <div className="flex flex-col items-center md:items-start gap-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className={`text-2xl transition-transform ${!voted && "hover:scale-125 active:scale-90"}`}
          >
            {(hover || rating) >= star ? (
              <FaStar className="text-yellow-400" />
            ) : (
              <FaRegStar className="text-zinc-600" />
            )}
          </button>
        ))}
      </div>
      {voted && <span className="text-[10px] text-green-500 font-bold animate-pulse">تم تسجيل تصويتك</span>}
    </div>
  );
}