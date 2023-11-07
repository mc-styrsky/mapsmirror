import type { RequestInit } from 'node-fetch';
export type XYZ2Url = (x: number, y: number, z: number) => Promise<{
  url?: string,
  params?: RequestInit
}>
