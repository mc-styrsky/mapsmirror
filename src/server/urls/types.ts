import type { RequestInit } from 'node-fetch';
export type XYZ2Url = (x: number, y: number, z: number) => Promise<{
  local?: boolean;
  params?: RequestInit;
  url?: string;
}>
