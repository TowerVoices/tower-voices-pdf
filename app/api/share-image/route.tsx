import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

// تشغيل الدالة على الـ Edge لضمان سرعة فائقة جداً في التوليد
export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // جلب بيانات النتيجة من الرابط
    const level = searchParams.get('level') || '1';
    const seconds = searchParams.get('seconds') || '0';
    const attempts = searchParams.get('attempts') || '0';
    const completionRate = searchParams.get('completionRate') || '0';
    const rewardName = searchParams.get('rewardName') || '';
    const rewardImage = searchParams.get('rewardImage') || '';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(to bottom, #1e1b4b, #000000)',
            color: '#ffffff',
            padding: '40px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <h1 style={{ fontSize: '56px', fontWeight: 'bold', color: '#818cf8', margin: '0 0 10px 0' }}>
              أصوات البرج
            </h1>
            <p style={{ fontSize: '24px', color: '#a1a1aa', margin: '0 0 40px 0' }}>
              تحدي مطابقة الشخصيات
            </p>

            {rewardImage && (
              <img
                src={rewardImage}
                alt=""
                style={{
                  width: '240px',
                  height: 'auto',
                  borderRadius: '16px',
                  marginBottom: '20px',
                }}
              />
            )}

            <h2 style={{ fontSize: '36px', fontWeight: 'bold', margin: '0 0 30px 0' }}>
              {rewardName}
            </h2>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                background: 'rgba(24, 24, 27, 0.6)',
                border: '2px solid #27272a',
                borderRadius: '24px',
                padding: '24px 40px',
                width: '450px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '22px', margin: '6px 0' }}>
                <span style={{ color: '#818cf8' }}>{level}</span>
                <span style={{ color: '#a1a1aa' }}>المستوى 🏆</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '22px', margin: '6px 0' }}>
                <span style={{ color: '#818cf8' }}>{seconds} ثانية</span>
                <span style={{ color: '#a1a1aa' }}>الزمن ⏱️</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '22px', margin: '6px 0' }}>
                <span style={{ color: '#818cf8' }}>{attempts}</span>
                <span style={{ color: '#a1a1aa' }}>المحاولات 🎯</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '22px', margin: '6px 0' }}>
                <span style={{ color: '#4ade80' }}>% {completionRate}</span>
                <span style={{ color: '#a1a1aa' }}>تفوق الأداء 📊</span>
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 800,
        height: 750,
      }
    );
  } catch (e: any) {
    return new Response(`Failed to generate image`, { status: 500 });
  }
}