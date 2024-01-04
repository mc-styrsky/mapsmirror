import { XYZ2UrlBingsat } from '../urls/bingsat';
import { XYZ2Url } from '../urls/default';
import { XYZ2UrlGebco } from '../urls/gebco';
import { XYZ2UrlGooglehybrid } from '../urls/googlehybrid';
import { XYZ2UrlGooglesat } from '../urls/googlesat';
import { XYZ2UrlGooglestreet } from '../urls/googlestreet';
import { XYZ2UrlNavionics } from '../urls/navionics';
import { XYZ2UrlOpenseamap } from '../urls/openseamap';
import { XYZ2UrlOpentopomap } from '../urls/opentopomap';
import { XYZ2UrlOsm } from '../urls/osm';
import { XYZ2UrlVfdensity } from '../urls/vfdensity';
import { XYZ2UrlWorthit } from '../urls/worthit';


export function getXYZ2Url (params: ConstructorParameters<typeof XYZ2Url>[0]): XYZ2Url {
  switch (params.provider) {
    case 'bingsat': return new XYZ2UrlBingsat(params);
    case 'gebco': return new XYZ2UrlGebco(params);
    case 'googlehybrid': return new XYZ2UrlGooglehybrid(params);
    case 'googlesat': return new XYZ2UrlGooglesat(params);
    case 'googlestreet': return new XYZ2UrlGooglestreet(params);
    case 'navionics': return new XYZ2UrlNavionics(params);
    case 'openseamap': return new XYZ2UrlOpenseamap(params);
    case 'opentopomap': return new XYZ2UrlOpentopomap(params);
    case 'osm': return new XYZ2UrlOsm(params);
    case 'vfdensity': return new XYZ2UrlVfdensity(params);
    case 'worthit': return new XYZ2UrlWorthit(params);
  }
  return new XYZ2Url(params);
}
