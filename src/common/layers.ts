import type { Layer } from './types/layer';

export const zoomMax = 20;
export const zoomMin = 2;

export class LayerSetup {
  private static layers: Record<Layer, {min?: number, max?: number, label: string}> = {
    '': { label: '- none -' },
    bingsat: { label: 'bSat' },
    gebco: { label: 'Depth', max: 9 },
    googlehybrid: { label: 'gHybrid' },
    googlesat: { label: 'gSat' },
    googlestreet: { label: 'gStreet' },
    navionics: { label: 'Navionics', max: 17 },
    openseamap: { label: 'oSea', max: 18 },
    opentopomap: { label: 'oTopo', max: 17 },
    osm: { label: 'oStreet', max: 19 },
    vfdensity: { label: 'Density', max: 12, min: 3 },
    worthit: { label: 'Worthit' },
  };
  static get (layer: Layer): {min: number, max: number, label: string} {
    const { label = 'unknown layer', max = zoomMax, min = zoomMin } = LayerSetup.layers[layer];
    return { label, max, min };
  }
}
