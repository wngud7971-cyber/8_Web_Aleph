import { randomBytes } from 'node:crypto';
import { generateRegistrationOptions } from '@simplewebauthn/server';
import { RP_ID, RP_NAME, USERNAME_RE } from '../_lib/config.js';
import { redis } from '../_lib/redis.js';
import { allowMethods, sameOrigin, getSession, json } from '../_lib/http.js';
import { saveChallenge } from '../_lib/challenge.js';

// 1단계: 서버가 "일회용 질문(challenge)"을 만들어 준다. 아직 아무것도 저장하지 않는다.
export default async function handler(req, res) {
  if (!allowMethods(req, res, ['POST']) || !sameOrigin(req, res)) return;

  const username = String(req.body?.username ?? '').trim().toLowerCase();
  if (!USERNAME_RE.test(username)) {
    return json(res, 400, { error: 'bad_username', message: '계정 이름은 영문 소문자·숫자·_·- 로 3~20자입니다.' });
  }

  const existing = await redis.get(`user:${username}`);
  let userId, isNew, excludeCredentials = [];

  if (existing) {
    // 이미 있는 계정에 패스키를 더하려면, 그 계정으로 이미 들어와 있어야 한다.
    const session = await getSession(req);
    if (!session || session.username !== username) {
      return json(res, 409, { error: 'username_taken', message: '이미 있는 계정 이름입니다. 이 계정에 패스키를 더하려면 먼저 그 계정으로 들어오세요.' });
    }
    userId = existing.id;
    isNew = false;
    // 이미 등록된 패스키는 제외 → 같은 기기에 같은 패스키가 두 번 만들어지지 않는다.
    const ids = await redis.smembers(`usercreds:${username}`);
    excludeCredentials = ids.map((id) => ({ id }));
  } else {
    userId = randomBytes(16).toString('base64url');
    isNew = true;
  }

  const options = await generateRegistrationOptions({
    rpName: RP_NAME,
    rpID: RP_ID,
    userName: username,
    userID: Buffer.from(userId, 'base64url'),
    attestationType: 'none',
    excludeCredentials,
    authenticatorSelection: { residentKey: 'required', userVerification: 'required' },
    timeout: 60000,
  });

  // 서버가 확인할 때까지 이 값을 서버에 보관한다. (키 = 질문 자체, 2분 뒤 자동 삭제)
  await saveChallenge(options.challenge, { type: 'reg', username, userId, isNew });
  return json(res, 200, options);
}
