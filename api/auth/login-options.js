import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { RP_ID } from '../_lib/config.js';
import { allowMethods, sameOrigin, json } from '../_lib/http.js';
import { saveChallenge } from '../_lib/challenge.js';

// 로그인도 매번 새 질문. 계정 이름을 묻지 않고(allowCredentials 비움) 기기가 가진 패스키를 고르게 한다.
export default async function handler(req, res) {
  if (!allowMethods(req, res, ['POST']) || !sameOrigin(req, res)) return;

  const options = await generateAuthenticationOptions({
    rpID: RP_ID,
    userVerification: 'required',
    allowCredentials: [],
    timeout: 60000,
  });
  await saveChallenge(options.challenge, { type: 'auth' });
  return json(res, 200, options);
}
