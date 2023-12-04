export type Baselayers =
| ''
| 'bingsat'
| 'bluemarble'
| 'gebco'
| 'googlehybrid'
| 'googlesat'
| 'googlestreet'
| 'opentopomap'
| 'osm'

export type Overlays =
| 'navionics'
| 'openseamap'
| 'vfdensity'

export type Layers = Baselayers | Overlays;

export type VirtLayers = Layers
| 'transparent'
