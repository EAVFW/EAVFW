import { revalidateTag } from 'next/cache';
import { ODataBuilder } from './odata/ODataBuilder';

export type TokenResponse = {
  access_token: string;
  not_after: number;
};
let token: TokenResponse | null = null;

async function renewToken() {
  //const spanContext = trace.getActiveSpan()?.spanContext()!;

  let token = (await fetch(`${process.env['NEXT_BUILD_API_BASEURL']}/connect/token`, {
    next: { tags: ['eavtoken'] },
    method: 'POST',
    headers: {
      authorization: `Basic ${btoa(process.env['NEXT_BUILD_API_CREDENCIALS']!)}`,
      ['content-type']: 'application/x-www-form-urlencoded',
      ['x-commit-sha']: process.env['VERCEL_GIT_COMMIT_SHA']!,
    },

    body: 'grant_type=client_credentials',
  }).then((r) => r.json())) as TokenResponse;
  const claims = JSON.parse(atob(token.access_token.split('.')[1]));
  const exp = claims.exp;
  token.not_after = parseInt(exp) * 1000;
  return token;
}

export const getTokenAsync = async () => {
  if (token && token.not_after > new Date().getTime()) return token;
  try {
    token = await renewToken();
    if (token.not_after < new Date().getTime()) {
      revalidateTag('eavtoken');
      token = await renewToken();
    }
  } catch (err) {
    throw err;
  }

  return token;
};

export const queryRecords = async <T>(
  url: string,
  query: ODataBuilder<T>,
  cache: RequestCache = 'default',
) => {
  const token = await getTokenAsync();

  url = `${process.env['NEXT_BUILD_API_BASEURL']}${url}?${query.build()}`;

  let a = await fetch(url, {
    cache: cache,
    method: 'GET',
    headers: {
      authorization: 'Bearer ' + token.access_token,
    },
  });
  if (!a.ok) {
    throw new Error(`Failedt to query.[${a.status}]\n${await a.text()}`);
  }

  let b = await a.json();

  return b?.items as Array<T>;
};

export const queryRecord = async <T>(
  url: string,
  query: ODataBuilder<T>,
  cache: RequestCache = 'default',
) => {
  const token = await getTokenAsync();

  url = `${process.env['NEXT_BUILD_API_BASEURL']}${url}?${query.build()}`;

  let a = await fetch(url, {
    cache: cache,
    method: 'GET',
    headers: {
      authorization: 'Bearer ' + token.access_token,
    },
  });
  if (!a.ok) {
    throw new Error(`Failedt to query.[${a.status}]\n${await a.text()}`);
  }

  let b = await a.json();

  return b?.value as T;
};

export const fetch_eav = async <T>(
  url: string,
  query: ODataBuilder<T>,
  cache: RequestCache = 'default',
) => {
  const token = await getTokenAsync();

  url = `${process.env['NEXT_BUILD_API_BASEURL']}${url}?${query.build()}`;

  let a = await fetch(url, {
    cache: cache,
    method: 'GET',
    headers: {
      authorization: 'Bearer ' + token.access_token,
    },
  });
  if (!a.ok) {
    throw new Error(`Failedt to query.[${a.status}]\n${await a.text()}`);
  }

  let b = await a.json();

  return b?.items as Array<T>;
};
