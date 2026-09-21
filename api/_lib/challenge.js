import { B64URL_RE, CHALLENGE_TTL } from './config.js';
import { redis } from './redis.js';

export async function saveChallenge(challenge, record) {
  await redis.set(`chal:${challenge}`, record, { ex: CHALLENGE_TTL });
}

// 브라우저가 서명한 clientDataJSON 안에는 "내가 받은 질문"이 들어 있다. 그 값을 꺼낸다.
export function challengeFrom(response) {
  try {
    const data = JSON.parse(Buffer.from(response.response.clientDataJSON, 'base64url').toString('utf8'));
    return typeof data.challenge === 'string' && B64URL_RE.test(data.challenge) ? data.challenge : null;
  } catch {
    return null;
  }
}

// 꺼내면서 동시에 지운다(GETDEL) → 같은 질문은 두 번 통하지 않는다.
export async function takeChallenge(challenge) {
  return redis.getdel(`chal:${challenge}`);
}
