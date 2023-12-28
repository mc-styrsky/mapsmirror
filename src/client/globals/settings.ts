import type { Baselayer, LayerSettings, Overlay } from '../../common/types/layer';
import { castObject } from '../../common/extractProperties';
import { LocalStorageItem } from '../utils/localStorageItem';
import { baselayers } from './baselayers';

export type CoordUnit = 'd' | 'dm' | 'dms';

class Settings {
  constructor () {
    const localStorageSettings = new LocalStorageItem<Settings>('settings').get();


    const baselayer = localStorageSettings?.baselayer ?? 'osm';
    this.baselayer = baselayers.includes(baselayer) ? baselayer : 'osm';

    this.show = castObject(localStorageSettings?.show, {
      crosshair: val => Boolean(val ?? true),
      navionics: Boolean,
      navionicsDetails: Boolean,
      openseamap: Boolean,
      suncalc: Boolean,
      vfdensity: Boolean,
    });
    this.units = castObject(localStorageSettings?.units, {
      coords: (val) => ['d', 'dm', 'dms'].includes(val) ? val : 'dm',
    });
  }

  readonly show: {
    crosshair: boolean
    navionicsDetails: boolean
    suncalc: boolean
  } & Record<Overlay, boolean>;
  baselayer: Baselayer;
  get tiles () {
    const ret: LayerSettings[] = this.overlayOrder
    .filter(l => this.show[l])
    .map(source => ({ alpha: this.alpha[source] ?? 1, source }));

    if (this.baselayer) ret.unshift({ alpha: 1, source: this.baselayer });
    return ret;
  }
  units:{
    coords: CoordUnit
  };
  private overlayOrder: Overlay[] = [
    'openseamap',
    'navionics',
    'vfdensity',
  ];
  private alpha: Partial<Record<Overlay, number>> = {
    vfdensity: 0.5,
  };
}

export const settings = new Settings();
