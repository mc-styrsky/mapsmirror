import type { Baselayer, LayerShowSettings, Overlay } from '../../common/types/layer';
import { castObject } from '../../common/castObject';
import { LocalStorageItem } from '../utils/localStorageItem';
import { baselayers } from './baselayers';

export type CoordUnit = 'd' | 'dm' | 'dms';

export class Settings {
  static show: {
    crosshair: boolean
    navionicsDetails: boolean
    suncalc: boolean
  } & Record<Overlay, boolean>;
  static baselayer: Baselayer;
  static get tiles () {
    const ret: LayerShowSettings[] = this.overlayOrder
    .filter(l => this.show[l])
    .map(source => ({ alpha: this.alpha[source] ?? 1, source }));

    if (this.baselayer) ret.unshift({ alpha: 1, source: this.baselayer });
    return ret;
  }
  static units:{
    coords: CoordUnit
  };
  private static overlayOrder: Overlay[] = [
    'openseamap',
    'navionics',
    'vfdensity',
  ];
  private static alpha: Partial<Record<Overlay, number>> = {
    vfdensity: 0.5,
  };

  static {
    const localStorageSettings = new LocalStorageItem<typeof Settings>('settings').get();


    const baselayer: Baselayer = localStorageSettings?.baselayer ?? 'osm';
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
      coords: (val) => {
        if (val === 'd') return 'd';
        if (val === 'dms') return 'dms';
        return 'dm';
      },
    });
  }
}
