export type Baselayer =
| ''
| 'bingsat'
| 'gebco'
| 'googlehybrid'
| 'googlesat'
| 'googlestreet'
| 'opentopomap'
| 'osm'
| 'worthit'

export type Overlay =
| 'navionics'
| 'openseamap'
| 'vfdensity'

export type Layer = Baselayer | Overlay;

export type VirtLayer = Layer
| 'transparent'

export interface LayerSettings {alpha: number, source: Layer}
