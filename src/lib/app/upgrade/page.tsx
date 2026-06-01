'use client';

import { useState } from 'react';

export default function UpgradePage() {
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url; // Stripe 결제 페이지로 이동
      } else {
        alert(data.error ?? '오류가 발생했습니다.');
        setLoading(false);
      }
    } catch {
      alert('결제 페이지를 여는 중 오류가 발생했습니다.');
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: '80px auto', padding: 24, textAlign: 'center' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>프로로 업그레이드</h1>
      <p style={{ color: '#666', marginTop: 12, lineHeight: 1.6 }}>
        모든 캐릭터 잠금 해제 · 무제한 대화
      </p>
      <button
        onClick={handleUpgrade}
        disabled={loading}
        style={{
          marginTop: 24,
          padding: '14px 28px',
          fontSize: 16,
          fontWeight: 600,
          background: '#635bff',
          color: '#fff',
          border: 'none',
          borderRadius: 10,
          cursor: loading ? 'default' : 'pointer',
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? '이동 중…' : '결제하고 프로 시작하기'}
      </button>
    </div>
  );
}
