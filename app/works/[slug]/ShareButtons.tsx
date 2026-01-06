"use client";

import {
  FaLink,
  FaTelegram,
  FaWhatsapp,
  FaXTwitter,
  FaDiscord,
  FaRedditAlien,
} from "react-icons/fa6";

export default function ShareButtons() {
  const url = typeof window !== "undefined" ? window.location.href : "";

  const base =
    "w-10 h-10 flex items-center justify-center rounded-lg text-white text-lg transition-all duration-200 hover:scale-110";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    alert("تم نسخ الرابط!");
  };

  return (
    // التغيير هنا: flex-row بدلاً من flex-col، وإضافة flex-wrap للتجاوب
    <div className="flex flex-row flex-wrap gap-3 justify-center items-center">

      {/* نسخ الرابط */}
      <button
        onClick={copyToClipboard}
        title="نسخ الرابط"
        className={`${base} bg-zinc-700 hover:bg-zinc-600`}
      >
        <FaLink />
      </button>

      {/* تيليغرام */}
      <a
        href={`https://t.me/share/url?url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`${base} bg-blue-600 hover:bg-blue-500`}
      >
        <FaTelegram />
      </a>

      {/* واتساب */}
      <a
        href={`https://wa.me/?text=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`${base} bg-green-600 hover:bg-green-500`}
      >
        <FaWhatsapp />
      </a>

      {/* إكس */}
      <a
        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`}
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

      {/* ريديت */}
      <a
        href={`https://www.reddit.com/submit?url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`${base} bg-orange-600 hover:bg-orange-500`}
      >
        <FaRedditAlien />
      </a>

    </div>
  );
}