import type { XYZ } from './xyz';
import type { RequestInit } from 'node-fetch';
export type XYZ2Url = (x: number, y: number, z: number) => Promise<{
  local?: boolean;
  params?: RequestInit;
  url?: string;
  worthIt?: ({ x, y, z }: XYZ) => Promise<boolean>
}>
