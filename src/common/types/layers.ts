export type Baselayers =
| ''
| 'bingsat'
| 'bluemarble'
| 'gebco'
| 'googlehybrid'
| 'googlesat'
| 'googlestreet'
| 'osm'

export type Overlays =
| 'openseamap'
| 'vfdensity'
| 'navionics'

export type Layers = Baselayers | Overlays;

export type VirtLayers = Layers
| 'transparent'
