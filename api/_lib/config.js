// 환경변수는 Vercel 대시보드에 넣습니다. 코드/저장소에는 값을 적지 않습니다.
//   RP_ID  = 결과물 도메인 (예: joohyung-sec-portfolio.vercel.app)  ← https://, 경로 없이
//   ORIGIN = https://결과물-도메인
// 로컬(vercel dev)에서는 기본값(localhost)이 쓰입니다.
export const RP_NAME = 'Bae Joohyung Security Portfolio';
export const RP_ID = process.env.RP_ID || 'localhost';
export const ORIGIN = process.env.ORIGIN || 'http://localhost:3000';

export const CHALLENGE_TTL = 120; // 초. 질문은 2분 안에 한 번만 쓸 수 있음
export const SESSION_TTL = 60 * 60; // 초. 세션 1시간

export const SECURE = ORIGIN.startsWith('https://');
export const COOKIE_NAME = SECURE ? '__Host-sid' : 'sid';

export const USERNAME_RE = /^[a-z0-9][a-z0-9_-]{2,19}$/;
export const B64URL_RE = /^[A-Za-z0-9_-]{16,1024}$/;
