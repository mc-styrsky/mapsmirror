import type { RequestInit } from 'node-fetch';
import fetch from 'node-fetch';
import { Readable } from 'stream';
import { xyz2googlehybrid } from '../urls/googlehybrid';

export const fetchFromTileServer = ({ params, provider, url, x, y, z }: { url: string; params: RequestInit; provider: string; x: number; y: number; z: number; }) => fetch(url, params)
.then(async (response) => {
  if (response.status === 200) return {
    body: response.body,
    status: response.status,
  };
  if (response.status === 404) {
    if (provider === 'googlesat') {
      const { url: urlHybrid } = await xyz2googlehybrid(x, y, z);
      if (urlHybrid) return fetchFromTileServer({ params, provider: 'googlehybrid', url: urlHybrid, x, y, z });
    }
    return {
      body: Readable.from(''),
      status: response.status,
    };
  }
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
