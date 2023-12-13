export type Baselayers =
| ''
| 'bingsat'
| 'gebco'
| 'googlehybrid'
| 'googlesat'
| 'googlestreet'
| 'opentopomap'
| 'osm'
| 'worthit'

export type Overlays =
| 'navionics'
| 'openseamap'
| 'vfdensity'

export type Layers = Baselayers | Overlays;

export type VirtLayers = Layers
| 'transparent'
