"use client";

import {
  FaLink,
  FaTelegram,
  FaWhatsapp,
  FaXTwitter,
  FaDiscord,
  FaRedditAlien,
} from "react-icons/fa6";

// تعريف البيانات المستقبلة لضمان مشاركة الرابط الصحيح لكل عمل
interface ShareProps {
  url: string;
  title: string;
}

export default function ShareButtons({ url, title }: ShareProps) {
  // إعداد نص المشاركة مع عنوان الرواية
  const shareText = `أنصحك بقراءة رواية: ${title}`;
  
  const base =
    "w-10 h-10 flex items-center justify-center rounded-lg text-white text-lg transition-all duration-200 hover:scale-110";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    alert("تم نسخ رابط الرواية بنجاح!");
  };

  return (
    <div className="flex flex-row flex-wrap gap-3 justify-center items-center">

      {/* نسخ الرابط المباشر للرواية */}
      <button
        onClick={copyToClipboard}
        title="نسخ الرابط"
        className={`${base} bg-zinc-700 hover:bg-zinc-600`}
      >
        <FaLink />
      </button>

      {/* مشاركة عبر تيليغرام مع العنوان */}
      <a
        href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`${base} bg-blue-600 hover:bg-blue-500`}
      >
        <FaTelegram />
      </a>

      {/* مشاركة عبر واتساب */}
      <a
        href={`https://wa.me/?text=${encodeURIComponent(shareText + " " + url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`${base} bg-green-600 hover:bg-green-500`}
      >
        <FaWhatsapp />
      </a>

      {/* مشاركة عبر منصة إكس (تويتر سابقاً) */}
      <a
        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`${base} bg-sky-700 hover:bg-sky-600`}
      >
        <FaXTwitter />
      </a>

      {/* ديسكورد */}
      <a
        href={`https://discord.com/channels/@me`}
        target="_blank"
        rel="noopener noreferrer"
        className={`${base} bg-indigo-600 hover:bg-indigo-500`}
      >
        <FaDiscord />
      </a>

      {/* مشاركة عبر ريديت */}
      <a
        href={`https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(shareText)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`${base} bg-orange-600 hover:bg-orange-500`}
      >
        <FaRedditAlien />
      </a>

    </div>
  );
}