import type { RequestInit } from 'node-fetch';
import fetch from 'node-fetch';
import { queues } from '../index';
import { xyz2googlehybrid } from '../urls/googlehybrid';

export const fetchFromTileServer = ({ params, provider, url, x, y, z }: { url: string; params: RequestInit; provider: string; x: number; y: number; z: number; }) => fetch(url, params)
.then(async (response) => {
  queues.fetched++;
  if (response.status === 200) return {
    body: response.body,
    status: response.status,
  };
  if (response.status === 404) {
    if (provider === 'googlesat') {
      const { url: urlHybrid } = await xyz2googlehybrid(x, y, z);
      console.log('fallback to hybrid', urlHybrid);
      if (urlHybrid) return fetchFromTileServer({ params, provider: 'googlehybrid', url: urlHybrid, x, y, z });
    }
    return {
      body: null,
      status: response.status,
    };
  }
  console.log(response.status, response.statusText, url);
  return {
    body: null,
    status: response.status,
  };
})
.catch(() => {
  return {
    body: null,
    status: 500,
  };
});
