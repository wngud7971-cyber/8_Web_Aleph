import { randomBytes } from 'node:crypto';
import { redis } from './redis.js';

// 계정을 만들 때 넣는 "만들어 넣은" 비공개 자료. 실제 개인정보가 아니다.
export function seedItems(username) {
  const tag = '[만들어 넣은 내용]';
  const code = randomBytes(2).toString('hex');
  return [
    { id: 'm1', kind: '프로젝트 메모', title: `${username}의 다음 프로젝트 (${code})`,
      body: `${tag} 로그 수집 파이프라인의 필드 타입을 먼저 표로 정리하고, 충돌이 날 만한 곳에 표시를 해 둔다.` },
    { id: 'm2', kind: '지원 목록', title: `${username}이 지원해 볼 곳 (${code})`,
      body: `${tag} 관제 직무 3곳, 기술지원 직무 2곳. 마감일이 가까운 순서로 정리.` },
    { id: 'm3', kind: '회고', title: `${username}의 이번 주 회고 (${code})`,
      body: `${tag} 막힌 원인을 한 줄로 먼저 적고 나서 손을 대니, 되돌아가는 일이 줄었다.` },
  ];
}

export async function loadItems(session) {
  const items = (await redis.get(`items:${session.userId}`)) ?? [];
  return { account: session.username, count: items.length, items };
}
