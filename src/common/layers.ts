import type { Layer } from './types/layer';

export const zoomMax = 20;
export const zoomMin = 2;

const min = zoomMin;
const max = zoomMax;
export const layers: Record<Layer, {min: number, max: number, label: string}> = {
  '': { label: '- none -', max, min },
  bingsat: { label: 'bSat', max, min },
  gebco: { label: 'Depth', max: 9, min },
  googlehybrid: { label: 'gHybrid', max, min },
  googlesat: { label: 'gSat', max, min },
  googlestreet: { label: 'gStreet', max, min },
  navionics: { label: 'Navionics', max: 17, min },
  openseamap: { label: 'oSea', max: 18, min },
  opentopomap: { label: 'oTopo', max: 17, min },
  osm: { label: 'oStreet', max: 19, min },
  vfdensity: { label: 'Density', max: 12, min: 3 },
  worthit: { label: 'Worthit', max, min },
};
