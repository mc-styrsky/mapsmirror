// src/server/index.ts
import { StyQueue as StyQueue2 } from "../node_modules/@mc-styrsky/queue/lib/index.js";
import express from "../node_modules/express/index.js";

// src/common/consts.ts
var port = 3e3;

// src/common/extractProperties.ts
function extractProperties(obj, builder) {
  return Object.entries(builder).reduce((ret, entry) => {
    const [key, constructor] = entry;
    ret[key] = constructor(obj?.[key]);
    return ret;
  }, {});
}

// src/server/requestHandler/getNavionicsIcon.ts
var getNavionicsIcon = async (req, res) => {
  const { iconId } = extractProperties(req.params, {
    iconId: String
  });
  try {
    await fetch(`https://webapp.navionics.com/api/v2/assets/images/${iconId}`).then(
      async (r) => {
        if (r.ok) {
          res?.send(Buffer.from(await r.arrayBuffer()));
        } else
          res?.sendStatus(r.status);
      },
      () => {
        res?.sendStatus(500);
      }
    );
  } catch (e) {
    console.error(e);
    res?.status(500).send("internal server error");
    return;
  }
};

// src/server/requestHandler/getNavionicsObjectinfo.ts
var objectinfoCache = /* @__PURE__ */ new Map();
var getNavionicsObjectinfo = async (req, res) => {
  try {
    const { itemId } = extractProperties(req.params, {
      itemId: String
    });
    const fromCache = objectinfoCache.get(itemId);
    if (fromCache) {
      console.log("[cached]", itemId);
      res?.json(fromCache);
    } else {
      console.log("[fetch] ", itemId);
      await fetch(`https://webapp.navionics.com/api/v2/objectinfo/marine/${itemId}`).then(
        async (r) => {
          if (r.ok) {
            const toCache = await r.json();
            objectinfoCache.set(itemId, toCache);
            res?.json(toCache);
          } else
            res?.sendStatus(r.status);
        },
        () => {
          res?.sendStatus(500);
        }
      );
    }
  } catch (e) {
    console.error(e);
    res?.status(500).send("internal server error");
    return;
  }
};

// src/common/x2lon.ts
var x2lonCommon = (x, tiles) => (x / tiles - 0.5) * Math.PI * 2;

// src/common/y2lat.ts
var y2latCommon = (y, tiles) => Math.asin(Math.tanh((0.5 - y / tiles) * 2 * Math.PI));

// src/server/requestHandler/getNavionicsQuickinfo.ts
var quickinfoCache = /* @__PURE__ */ new Map();
var getNavionicsQuickinfo = async (req, res) => {
  const { x, y, z } = extractProperties(req.params, {
    x: Number,
    y: Number,
    z: Number
  });
  try {
    const { lat, lon } = {
      lat: y2latCommon(y, 1 << z) * 180 / Math.PI,
      lon: x2lonCommon(x, 1 << z) * 180 / Math.PI
    };
    const xyz = `${z}_${x}_${y}`;
    const fromCache = quickinfoCache.get(xyz);
    if (fromCache) {
      console.log("[cached]", xyz);
      res?.json(fromCache);
    } else {
      console.log("[fetch] ", xyz);
      await fetch(`https://webapp.navionics.com/api/v2/quickinfo/marine/${lat}/${lon}?z=${Math.max(2, Math.min(Number(z), 17))}&ugc=true&lang=en`).then(
        async (r) => {
          if (r.ok) {
            const toCache = await r.json();
            quickinfoCache.set(xyz, toCache);
            res?.json(toCache);
          } else
            res?.sendStatus(r.status);
        },
        () => {
          res?.sendStatus(500);
        }
      );
    }
  } catch (e) {
    console.error(e);
    res?.status(500).send("internal server error");
    return;
  }
};

// src/server/requestHandler/getTile.ts
import { StyQueue } from "../node_modules/@mc-styrsky/queue/lib/index.js";

// src/common/modulo.ts
var modulo = (val, mod) => {
  const ret = val % mod;
  return ret < 0 ? ret + mod : ret;
};

// src/server/utils/xyz2quadkey.ts
var xyz2quadkey = ({ x, y, z }) => {
  return (parseInt(y.toString(2), 4) * 2 + parseInt(x.toString(2), 4)).toString(4).padStart(z, "0");
};

// src/server/urls/default.ts
import { mkdir, stat, unlink, writeFile } from "fs/promises";

// src/server/utils/getTileParams.ts
var getTileParams = ({ x, y, z }) => {
  const length = z + 3 >> 2;
  const pathX = modulo(x, 1 << z).toString(16).padStart(length, "0").split("");
  const pathY = modulo(y, 1 << z).toString(16).padStart(length, "0").split("");
  const tileFileId = `${pathX.pop()}${pathY.pop()}`;
  const tilePath = pathX.map((_val, idx) => pathX[idx] + pathY[idx]).join("/");
  const tileId = `${tilePath}/${tileFileId}`;
  return {
    tileFileId,
    tileId,
    tilePath,
    z
  };
};

// src/server/utils/worthit.ts
import sharp from "../node_modules/sharp/lib/index.js";
var worthItDatabase = {
  max: {},
  min: {}
};
var populateDatabase = (z, base, func) => {
  ((worthItDatabase[func][z] ??= {})[0] ??= {})[0] = base;
  if (z < -8)
    return;
  const cmp = Math[func];
  const nextBase = Buffer.alloc(256 * 256, 0);
  for (let x = 0; x < 128; x++) {
    for (let y = 0; y < 128; y++) {
      nextBase[y * 256 + x] = cmp(
        base[y * 2 * 256 + x * 2],
        base[(y * 2 + 1) * 256 + x * 2],
        base[y * 2 * 256 + (x * 2 + 1)],
        base[(y * 2 + 1) * 256 + (x * 2 + 1)]
      );
    }
  }
  populateDatabase(z - 1, nextBase, func);
};
populateDatabase(0, await sharp("tiles/gebcomax/0/00.png").greyscale().toFormat("raw").toBuffer(), "max");
populateDatabase(0, await sharp("tiles/gebcomin/0/00.png").greyscale().toFormat("raw").toBuffer(), "min");
console.log(worthItDatabase);
var worthItMinMax = async ({ x, y, z }) => {
  while (x < 0)
    x += 1 << z;
  while (y < 0)
    y += 1 << z;
  if (z > 17) {
    x = x >> z - 17;
    y = y >> z - 17;
    z = 17;
  }
  if (y >= (1 << z) / 4 * 3)
    return null;
  const z8 = z - 8;
  const x8 = x >> 8;
  const y8 = y >> 8;
  const tileMax = worthItDatabase.max[z8]?.[x8]?.[y8];
  const tileMin = worthItDatabase.min[z8]?.[x8]?.[y8];
  if (tileMin && tileMax) {
    const pos = (x & 255) + (y & 255) * 256;
    const max = tileMax[pos];
    const min = tileMin[pos];
    return { max, min };
  }
  const { tileId } = getTileParams({ x: x8, y: y8, z: z8 });
  if (z8 < 0)
    console.log({ tileId, x, x8, y, y8, z, z8 });
  const path = `${z8.toString(36)}/${tileId}`;
  ((worthItDatabase.max[z8] ??= {})[x8] ??= {})[y8] = await sharp(`tiles/gebcomax/${path}.png`).greyscale().toFormat("raw").toBuffer();
  ((worthItDatabase.min[z8] ??= {})[x8] ??= {})[y8] = await sharp(`tiles/gebcomin/${path}.png`).greyscale().toFormat("raw").toBuffer();
  return worthItMinMax({ x, y, z });
};

// src/server/urls/default.ts
var XYZ2Url = class {
  constructor({ provider, quiet, x, y, z }) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.provider = provider;
    this.quiet = Boolean(quiet);
    this.verbose = !this.quiet;
    this.fallback = null;
  }
  provider;
  quiet;
  verbose;
  fallback;
  local = false;
  params = {};
  url = "";
  worthIt = async ({ x, y, z }) => {
    const res = await worthItMinMax({ x, y, z });
    if (!res)
      return false;
    const { max, min } = res;
    if (z <= 6)
      return min < 132;
    if (z <= 10)
      return max > 1 && min < 132;
    return max > 96 && min < 144 && (max < 132 || max - min > 3);
  };
  worthItArea = async ({ x, y, z }) => {
    return (await Promise.all([
      this.worthIt({ x, y, z }),
      this.worthIt({ x, y: y - 1, z }),
      this.worthIt({ x, y: y + 1, z }),
      this.worthIt({ x: x - 1, y, z }),
      this.worthIt({ x: x - 1, y: y - 1, z }),
      this.worthIt({ x: x - 1, y: y + 1, z }),
      this.worthIt({ x: x + 1, y, z }),
      this.worthIt({ x: x + 1, y: y - 1, z }),
      this.worthIt({ x: x + 1, y: y + 1, z })
    ])).some(Boolean);
  };
  x;
  y;
  z;
  fetchFromTileServer = async () => {
    const { url, x, y, z } = this;
    return fetch(await url, await this.params).then(async (response) => {
      queues.fetched++;
      if (response.status === 200)
        return {
          body: await response.arrayBuffer(),
          status: response.status
        };
      if (response.status === 404) {
        if (this.fallback) {
          const fallbackProvider = this.fallback.name.substring(7).toLowerCase();
          const fallback = new this.fallback({
            provider: fallbackProvider,
            quiet: this.quiet,
            x,
            y,
            z
          });
          console.log("fallback to", fallbackProvider, await fallback.url);
          return fallback.fetchFromTileServer();
        }
        return {
          body: null,
          status: response.status
        };
      }
      console.log(response.status, response.statusText, url);
      return {
        body: null,
        status: response.status
      };
    }).catch(() => {
      return {
        body: null,
        status: 500
      };
    });
  };
  sendTile = async (res) => {
    const url = await this.url;
    const params = await this.params;
    const { x, y, z } = this;
    const max = 1 << z;
    if (!url) {
      res?.sendStatus(404);
      return false;
    }
    const { tileFileId, tilePath } = getTileParams({ x, y, z });
    const file = `${tileFileId}.png`;
    const path = `tiles/${this.provider}/${z.toString(36)}/${tilePath}`;
    await mkdir(path, { recursive: true });
    const filename = `${pwd}/${path}/${file}`;
    const statsStart = performance.now();
    const fileStats = await stat(filename).then(async (stats) => {
      if (!stats.isFile())
        return null;
      if (this.provider === "googlesat" && stats.size < 100) {
        await unlink(filename);
        return null;
      }
      return stats;
    }).catch(() => null);
    queues.stats = performance.now() - statsStart;
    queues.statsCount++;
    if (fileStats) {
      if (this.verbose)
        console.log("[cached]", filename);
      res?.sendFile(filename);
      return true;
    }
    if (this.local) {
      res?.sendStatus(404);
      return false;
    }
    const worthitStart = performance.now();
    if (this.verbose || await this.worthItArea({ x, y, z })) {
      const imageStream = await queues.fetch.enqueue(async () => {
        const timeoutController = new globalThis.AbortController();
        const timeoutTimeout = setTimeout(() => timeoutController.abort(), 1e4);
        params.signal = timeoutController.signal;
        const ret = await this.fetchFromTileServer();
        clearTimeout(timeoutTimeout);
        return ret;
      });
      if (imageStream.body) {
        res?.send(Buffer.from(imageStream.body));
        await writeFile(filename, Buffer.from(imageStream.body));
        return true;
      }
      console.log("no imagestream", imageStream.status, { x: (x / max).toFixed(4), y: (y / max).toFixed(4), z }, url);
      res?.sendStatus(imageStream.status ?? 500);
      return false;
    }
    queues.worthit += performance.now() - worthitStart;
    queues.worthitCount++;
    res?.sendFile(`${pwd}/unworthy.png`);
    return false;
  };
};

// src/server/urls/bingsat.ts
var XYZ2UrlBingsat = class extends XYZ2Url {
  constructor(params) {
    super(params);
    const { x, y, z } = params;
    if (z >= 2 && z <= 20)
      this.url = `https://t.ssl.ak.tiles.virtualearth.net/tiles/a${xyz2quadkey({ x, y, z })}.jpeg?g=14041&n=z&prx=1`;
  }
};

// src/server/urls/cache.ts
var XYZ2UrlCache = class extends XYZ2Url {
  constructor(params) {
    super(params);
    const { x, y, z } = params;
    if (z >= 2 && z <= 9)
      this.url = `./cache/tiles/${z}/${x}/${y}.png`;
    this.local = true;
  }
};

// src/server/urls/gebco.ts
var XYZ2UrlGebco = class extends XYZ2Url {
  constructor(params) {
    super(params);
    const { x, y, z } = params;
    this.local = true;
    if (z >= 2 && z <= 9)
      this.url = `./gebco/tiles/${z}/${x}/${y}.png`;
  }
};

// src/server/urls/googlehybrid.ts
var XYZ2UrlGooglehybrid = class extends XYZ2Url {
  constructor(params) {
    super(params);
    const { x, y, z } = params;
    if (z >= 2 && z <= 20)
      this.url = `https://mt.google.com/vt/lyrs=y&x=${x}&y=${y}&z=${z}`;
  }
};

// src/server/urls/googlesat.ts
var XYZ2UrlGooglesat = class extends XYZ2Url {
  constructor(params) {
    super(params);
    const { x, y, z } = params;
    this.fallback = XYZ2UrlGooglehybrid;
    if (z >= 2 && z <= 20)
      this.url = `https://mt.google.com/vt/lyrs=s&x=${x}&y=${y}&z=${z}`;
  }
};

// src/server/urls/googlestreet.ts
var XYZ2UrlGooglestreet = class extends XYZ2Url {
  constructor(params) {
    super(params);
    const { x, y, z } = params;
    if (z >= 2 && z <= 20)
      this.url = `https://mt.google.com/vt/lyrs=m&x=${x}&y=${y}&z=${z}`;
  }
};

// src/server/urls/navionics.ts
var navtoken = null;
setInterval(() => navtoken = null, 10 * 60 * 1e3);
var getNavtoken = async () => {
  try {
    navtoken ??= await fetch("https://backend.navionics.com/tile/get_key/NAVIONICS_WEBAPP_P01/webapp.navionics.com?_=1699259111356", {
      credentials: "omit",
      headers: {
        Accept: "text/plain, */*; q=0.01",
        "Accept-Language": "de,de-DE;q=0.8,en-US;q=0.5,en;q=0.3",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-site",
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/119.0"
      },
      method: "GET",
      mode: "cors",
      referrer: "https://webapp.navionics.com/"
    }).then((res) => {
      if (res.status === 200)
        return res.text();
      return null;
    }).catch(() => null);
  } catch {
    navtoken = null;
  }
  return navtoken;
};
var XYZ2UrlNavionics = class extends XYZ2Url {
  constructor(params) {
    super(params);
    const { x, y, z } = params;
    if ([
      z <= 17,
      z >= 2,
      y >= 14922 >> 17 - z,
      y <= 92442 >> 17 - z
    ].every(Boolean)) {
      this.url = getNavtoken().then(
        (token) => token ? `https://backend.navionics.com/tile/${z}/${x}/${y}?LAYERS=config_1_0.00_0&TRANSPARENT=TRUE&UGC=TRUE&theme=0&navtoken=${token}` : ""
      );
      this.params = getNavtoken().then(
        (token) => token ? {
          credentials: "omit",
          headers: {
            Accept: "image/avif,image/webp,*/*",
            "Accept-Language": "de,de-DE;q=0.8,en-US;q=0.5,en;q=0.3",
            "Sec-Fetch-Dest": "image",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-site",
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/119.0"
          },
          method: "GET",
          mode: "cors",
          referrer: "https://webapp.navionics.com/"
        } : {}
      );
    }
  }
};

// src/server/urls/openseamap.ts
var XYZ2UrlOpenseamap = class extends XYZ2Url {
  constructor(params) {
    super(params);
    const { x, y, z } = params;
    if (z >= 2 && z <= 18)
      this.url = `https://tiles.openseamap.org/seamark/${z}/${x}/${y}.png`;
  }
};

// src/server/urls/opentopomap.ts
var XYZ2UrlOpentopomap = class extends XYZ2Url {
  constructor(params) {
    super(params);
    const { x, y, z } = params;
    if (z >= 2 && z <= 17)
      this.url = `https://tile.opentopomap.org/${z}/${x}/${y}.png`;
  }
};

// src/server/urls/osm.ts
var XYZ2UrlOsm = class extends XYZ2Url {
  constructor(params) {
    super(params);
    const { x, y, z } = params;
    if (z >= 2 && z <= 20)
      this.url = `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
  }
};

// src/server/urls/vfdensity.ts
var XYZ2UrlVfdensity = class extends XYZ2Url {
  constructor(params) {
    super(params);
    const { x, y, z } = params;
    if (z >= 2 && z <= 20)
      this.url = `https://density.tiles.vesselfinder.net/all/${z}/${x}/${y}.png`;
  }
};

// src/server/urls/worthit.ts
import sharp2 from "../node_modules/sharp/lib/index.js";
import { Readable } from "stream";

// src/client/globals/tileSize.ts
var tileSize = 256;

// src/server/urls/worthit.ts
var XYZ2UrlWorthit = class extends XYZ2Url {
  constructor(params) {
    super(params);
    const { x, y, z } = this;
    this.url = `./worthit/tiles/${z}/${x}/${y}.png`;
  }
  fetchFromTileServer = async () => {
    const { x, y, z } = this;
    const tile = new Uint8Array(3 * tileSize * tileSize);
    for (let zi = 0; zi <= 8; zi++) {
      const color = zi > 4 ? [0, Math.min(32 << zi - 4, 255), 0] : zi > 0 ? [0, 0, Math.min(32 << zi - 1, 255)] : [Math.min(64 << zi, 255), 0, 0];
      for (let yi = 0; yi < 1 << zi; yi++) {
        const yiOffset = yi << 8 - zi;
        for (let xi = 0; xi < 1 << zi; xi++) {
          const xiOffset = xi << 8 - zi;
          const [cr, cg, cb] = await this.worthItArea({
            x: (x << zi) + xi,
            y: (y << zi) + yi,
            z: z + zi
          }) ? color : [0, 0];
          if (cr || cg || cb) {
            for (let row = 0; row < 1 << 8 - zi; row++) {
              for (let col = 0; col < 1 << 8 - zi; col++) {
                const pos = ((yiOffset + row) * 256 + (xiOffset + col)) * 3;
                tile[pos] = cr;
                tile[pos + 1] = cg;
                tile[pos + 2] = cb;
              }
            }
          }
        }
      }
    }
    const body = await sharp2(tile, {
      raw: {
        channels: 3,
        height: 256,
        width: 256
      }
    }).png().toBuffer();
    return {
      body: Readable.from(body),
      status: 200
    };
  };
};

// src/server/utils/printStats.ts
var todoLast = 0;
var fetchedLast = 0;
var maxzoom = -1;
var getMaxzoom = () => maxzoom;
var setMaxzoom = (z) => maxzoom = z;
var printStats = () => {
  if (!queues.statsCount && !queues.worthitCount && maxzoom < 0 && !queues.checked)
    return;
  const partialSum = (n) => (1 - Math.pow(4, n)) / (1 - 4);
  const todo = Object.entries(queues.childs).reduce(
    (sum, [key, queue]) => {
      const len = queue.length;
      const collapsed = queues.childsCollapsed[key] ?? 0;
      sum += Math.round(collapsed * partialSum(maxzoom - parseInt(key)));
      sum += Math.round(len * partialSum(maxzoom - 1 - parseInt(key)));
      return sum;
    },
    0
  );
  const done = todoLast - todo;
  todoLast = todo;
  console.log({
    avg: { stats: queues.stats / queues.statsCount, worthit: queues.worthit / queues.worthitCount },
    childs: Object.fromEntries(
      Object.entries(queues.childs).filter(([, v]) => v?.length).map(([key, queue]) => [key, `${queue.length} (${queues.childsCollapsed[key] ?? 0})`])
    ),
    fetched: `${queues.fetched - fetchedLast}/${queues.checked} (${queues.fetched})`,
    perf: {
      done,
      maxzoom,
      todo: todo.toPrecision(4)
    },
    queues: {
      fetch: queues.fetch.length,
      quiet: queues.quiet.length,
      verbose: queues.verbose.length
    }
  });
  fetchedLast = queues.fetched;
  queues.checked = 0;
  queues.stats = 0;
  queues.statsCount = 0;
  queues.worthit = 0;
  queues.worthitCount = 0;
  maxzoom = -1;
};

// src/server/requestHandler/getTile.ts
var getTile = async (req, res) => {
  try {
    const { zoom } = extractProperties(req.params, {
      zoom: (val) => parseInt(String(val))
    });
    if (zoom > getMaxzoom())
      setMaxzoom(zoom);
    const parsePosition = (val) => {
      return modulo(parseInt(String(val), 16), 1 << zoom);
    };
    const { provider, x, y } = extractProperties(req.params, {
      provider: String,
      x: parsePosition,
      y: parsePosition
    });
    const { quiet, ttl } = extractProperties(req.query, {
      quiet: (val) => Boolean(parseInt(String(val ?? 0))),
      ttl: (val) => parseInt(String(val ?? 3))
    });
    const queue = quiet ? queues.quiet : queues.verbose;
    const fetchChilds = await queue.enqueue(() => {
      try {
        const xyz2url = new ({
          bingsat: XYZ2UrlBingsat,
          cache: XYZ2UrlCache,
          gebco: XYZ2UrlGebco,
          googlehybrid: XYZ2UrlGooglehybrid,
          googlesat: XYZ2UrlGooglesat,
          googlestreet: XYZ2UrlGooglestreet,
          navionics: XYZ2UrlNavionics,
          openseamap: XYZ2UrlOpenseamap,
          opentopomap: XYZ2UrlOpentopomap,
          osm: XYZ2UrlOsm,
          vfdensity: XYZ2UrlVfdensity,
          worthit: XYZ2UrlWorthit
        }[provider] ?? XYZ2Url)({ provider, quiet, x, y, z: zoom });
        return xyz2url.sendTile(res);
      } catch (e) {
        console.log(e);
        return false;
      }
    });
    queues.checked++;
    if (fetchChilds && ttl > 0 && zoom < 16)
      pushToQueues({ provider, ttl, x, y, zoom });
    return fetchChilds;
  } catch (e) {
    console.error(e);
    res?.status(500).send("internal server error");
    return null;
  }
};
async function fetchChildTile({ dx, dy, provider, ttl, x, y, zoom }) {
  try {
    await getTile(
      {
        params: {
          provider,
          x: (x * 2 + dx).toString(16),
          y: (y * 2 + dy).toString(16),
          zoom: String(zoom + 1)
        },
        query: {
          quiet: "1",
          ttl: String(ttl - 1)
        }
      },
      null
    );
  } catch (e) {
    console.log(e);
  }
}
async function pushToQueues({ provider, ttl, x, y, zoom }) {
  queues.childsCollapsed[zoom] ??= 0;
  queues.childs[zoom] ??= new StyQueue(1e3);
  const childQueue = queues.childs[zoom];
  queues.childsCollapsed[zoom]++;
  while (childQueue.length > 100)
    await (queues.childs[zoom - 1] ??= new StyQueue(1e3)).enqueue(() => new Promise((r) => setTimeout(r, childQueue.length / 1)));
  queues.childsCollapsed[zoom]--;
  childQueue.enqueue(() => fetchChildTile({ dx: 0, dy: 0, provider, ttl, x, y, zoom }));
  childQueue.enqueue(() => fetchChildTile({ dx: 0, dy: 1, provider, ttl, x, y, zoom }));
  childQueue.enqueue(() => fetchChildTile({ dx: 1, dy: 0, provider, ttl, x, y, zoom }));
  childQueue.enqueue(() => fetchChildTile({ dx: 1, dy: 1, provider, ttl, x, y, zoom }));
}

// src/server/index.ts
var pwd = "/home/sty/Documents/GitHub/mapsmirror";
var queues = {
  checked: 0,
  childs: {},
  childsCollapsed: {},
  fetch: new StyQueue2(10),
  fetched: 0,
  quiet: new StyQueue2(1e3),
  stats: 0,
  statsCount: 0,
  verbose: new StyQueue2(100),
  worthit: 0,
  worthitCount: 0
};
express().use(express.json()).use(express.urlencoded({ extended: true })).use("", express.static("public")).get("/tile/:provider/:zoom/:x/:y", getTile).get("/navionics/icon/:iconId", getNavionicsIcon).get("/navionics/quickinfo/:z/:x/:y", getNavionicsQuickinfo).get("/navionics/objectinfo/:itemId", getNavionicsObjectinfo).listen(port, () => console.log(`backend listener running on port ${port}`)).on("error", (e) => {
  console.error(`cannot start listener on port ${port}`);
  console.log(e);
});
setInterval(printStats, 2e3);
export {
  pwd,
  queues
};
//# sourceMappingURL=index.js.map
