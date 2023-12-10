import type { XYZ2Url } from '../../common/types/xyz2url';

let navtoken: null | string = null;

setInterval(() => navtoken = null, 10 * 60 * 1000);

const getNavtoken = async () => {
  navtoken ??= await fetch('https://backend.navionics.com/tile/get_key/NAVIONICS_WEBAPP_P01/webapp.navionics.com?_=1699259111356', {
    credentials: 'omit',
    headers: {
      Accept: 'text/plain, */*; q=0.01',
      'Accept-Language': 'de,de-DE;q=0.8,en-US;q=0.5,en;q=0.3',
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-site',
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/119.0',
    },
    method: 'GET',
    mode: 'cors',
    referrer: 'https://webapp.navionics.com/',
  }).then(res => {
    if (res.status === 200) return res.text();
    return null;
  });
  return navtoken;
};

export const xyz2navionics: XYZ2Url = async (x, y, z) => {
  if (z > 17) return {};
  if (z < 2) return {};
  if (y < 14922 >> 17 - z) return {};
  if (y > 92442 >> 17 - z) return {};
  if (await getNavtoken()) return {
    params: {
      credentials: 'omit',
      headers: {
        Accept: 'image/avif,image/webp,*/*',
        'Accept-Language': 'de,de-DE;q=0.8,en-US;q=0.5,en;q=0.3',
        'Sec-Fetch-Dest': 'image',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-site',
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/119.0',
      },
      method: 'GET',
      mode: 'cors',
      referrer: 'https://webapp.navionics.com/',
    },
    url: `https://backend.navionics.com/tile/${z}/${x}/${y}?LAYERS=config_1_20.00_1&TRANSPARENT=TRUE&UGC=TRUE&theme=0&navtoken=${await getNavtoken()}`,
  };
  return {};
};
