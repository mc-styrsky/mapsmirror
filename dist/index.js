// src/server/index.ts
import { StyQueue as StyQueue2 } from "../node_modules/@mc-styrsky/queue/lib/index.js";
import express from "../node_modules/express/index.js";

// src/common/consts.ts
var port = 3e3;

// src/server/requestHandler/getTile.ts
import { StyQueue } from "../node_modules/@mc-styrsky/queue/lib/index.js";
import { createWriteStream } from "fs";
import { mkdir, stat, unlink } from "fs/promises";

// src/common/extractProperties.ts
function extractProperties(obj, builder) {
  return Object.entries(builder).reduce((ret, entry) => {
    const [key, constructor] = entry;
    ret[key] = constructor(obj[key]);
    return ret;
  }, {});
}

// src/server/utils/xyz2quadkey.ts
var xyz2quadkey = ({ x, y, z }) => {
  return (parseInt(y.toString(2), 4) * 2 + parseInt(x.toString(2), 4)).toString(4).padStart(z, "0");
};

// src/server/urls/bingsat.ts
var xyz2bingsat = async (x, y, z) => {
  if (z > 20)
    return {};
  return {
    url: `https://t.ssl.ak.tiles.virtualearth.net/tiles/a${xyz2quadkey({ x, y, z })}.jpeg?g=14041&n=z&prx=1`
  };
};

// src/server/urls/bluemarble.ts
var xyz2bluemarble = async (x, y, z) => {
  if (z > 9)
    return {};
  return {
    url: `https://s3.amazonaws.com/com.modestmaps.bluemarble/${z}-r${y}-c${x}.jpg`
  };
};

// src/server/urls/cache.ts
var xyz2cache = async (x, y, z) => {
  if (z > 9)
    return {};
  return {
    local: true,
    url: `./cache/tiles/${z}/${x}/${y}.png`
  };
};

// src/server/urls/default.ts
var xyz2default = async () => ({});

// src/server/urls/gebco.ts
var xyz2gebco = async (x, y, z) => {
  if (z > 9)
    return {};
  return {
    local: true,
    url: `./gebco/tiles/${z}/${x}/${y}.png`
  };
};

// src/server/urls/googlehybrid.ts
var xyz2googlehybrid = async (x, y, z) => {
  if (z > 20)
    return {};
  return {
    url: `https://mt.google.com/vt/lyrs=y&x=${x}&y=${y}&z=${z}`
  };
};

// src/server/urls/googlesat.ts
var xyz2googlesat = async (x, y, z) => {
  if (z > 20)
    return {};
  return {
    url: `https://mt.google.com/vt/lyrs=s&x=${x}&y=${y}&z=${z}`
  };
};

// src/server/urls/googlestreet.ts
var xyz2googlestreet = async (x, y, z) => {
  if (z > 20)
    return {};
  return {
    url: `https://mt.google.com/vt/lyrs=m&x=${x}&y=${y}&z=${z}`
  };
};

// src/server/urls/navionics.ts
var navtoken = null;
setInterval(() => navtoken = null, 10 * 60 * 1e3);
var getNavtoken = async () => {
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
  });
  return navtoken;
};
var xyz2navionics = async (x, y, z) => {
  if (z > 17)
    return {};
  if (await getNavtoken())
    return {
      params: {
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
      },
      url: `https://backend.navionics.com/tile/${z}/${x}/${y}?LAYERS=config_1_20.00_0&TRANSPARENT=FALSE&UGC=TRUE&theme=0&navtoken=${await getNavtoken()}`
    };
  return {};
};

// src/server/urls/osm.ts
var xyz2osm = async (x, y, z) => {
  if (z > 20)
    return {};
  return {
    url: `https://tile.openstreetmap.org/${z}/${x}/${y}.png`
  };
};

// src/server/utils/fetchFromTileServer.ts
import fetch2 from "../node_modules/node-fetch/src/index.js";
var fetchFromTileServer = ({ params, provider, url, x, y, z }) => fetch2(url, params).then(async (response) => {
  queues.fetched++;
  if (response.status === 200)
    return {
      body: response.body,
      status: response.status
    };
  if (response.status === 404) {
    if (provider === "googlesat") {
      const { url: urlHybrid } = await xyz2googlehybrid(x, y, z);
      console.log("fallback to hybrid", urlHybrid);
      if (urlHybrid)
        return fetchFromTileServer({ params, provider: "googlehybrid", url: urlHybrid, x, y, z });
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

// src/server/utils/getTileParams.ts
var getTileParams = ({ x, y, z }) => {
  const length = z + 3 >> 2;
  const pathX = (x % (1 << z)).toString(16).padStart(length, "0").split("");
  const pathY = (y % (1 << z)).toString(16).padStart(length, "0").split("");
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

// src/server/utils/printStats.ts
var todoLast = 0;
var fetchedLast = 0;
var maxzoom = -1;
var getMaxzoom = () => maxzoom;
var setMaxzoom = (z) => maxzoom = z;
var printStats = () => {
  const partialSum = (n) => (1 - Math.pow(4, n)) / (1 - 4);
  const todo = Object.entries(queues.childs).reduce(
    (sum, [key, queue]) => {
      const len = queue.length;
      const collapsed = queues.childsCollapsed[key] ?? 0;
      sum += Math.round(collapsed * partialSum(17 - parseInt(key)));
      sum += Math.round(len * partialSum(16 - parseInt(key)));
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
var worthIt = async ({ x, y, z }) => {
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
    return false;
  const z8 = z - 8;
  const x8 = x >> 8;
  const y8 = y >> 8;
  const tileMax = worthItDatabase.min[z8]?.[x8]?.[y8];
  const tileMin = worthItDatabase.min[z8]?.[x8]?.[y8];
  if (tileMin && tileMax) {
    const pos = (x & 255) + (y & 255) * 256;
    const max = tileMax[pos];
    const min = tileMin[pos];
    return max > 96 && min < 144;
  }
  const { tileId } = getTileParams({ x: x8, y: y8, z: z8 });
  if (z8 < 0)
    console.log({ tileId, x, x8, y, y8, z, z8 });
  const path = `${z8.toString(36)}/${tileId}`;
  ((worthItDatabase.max[z8] ??= {})[x8] ??= {})[y8] = await sharp(`tiles/gebcomax/${path}.png`).greyscale().toFormat("raw").toBuffer();
  ((worthItDatabase.min[z8] ??= {})[x8] ??= {})[y8] = await sharp(`tiles/gebcomin/${path}.png`).greyscale().toFormat("raw").toBuffer();
  return worthIt({ x, y, z });
};

// src/server/requestHandler/getTile.ts
var getTile = async (req, res) => {
  try {
    const { zoom } = extractProperties(req.params, {
      zoom: (val) => parseInt(String(val))
    });
    if (zoom > getMaxzoom())
      setMaxzoom(zoom);
    const max = 1 << zoom;
    const parsePosition = (val) => {
      const ret = parseInt(String(val), 16) % max;
      return ret < 0 ? ret + max : ret;
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
    const fetchChilds = await queue.enqueue(async () => {
      try {
        const { local = false, params = {}, url = "" } = await ({
          bingsat: xyz2bingsat,
          bluemarble: xyz2bluemarble,
          cache: xyz2cache,
          gebco: xyz2gebco,
          googlehybrid: xyz2googlehybrid,
          googlesat: xyz2googlesat,
          googlestreet: xyz2googlestreet,
          navionics: xyz2navionics,
          osm: xyz2osm
        }[provider] ?? xyz2default)(x, y, zoom);
        if (!url) {
          res?.sendStatus(404);
          return false;
        }
        const { tileFileId, tilePath } = getTileParams({ x, y, z: zoom });
        const file = `${tileFileId}.png`;
        const path = `tiles/${provider}/${zoom.toString(36)}/${tilePath}`;
        await mkdir(path, { recursive: true });
        const filename = `${pwd}/${path}/${file}`;
        const statsStart = performance.now();
        const fileStats = await stat(filename).then(async (stats) => {
          if (!stats.isFile())
            return null;
          if (provider === "googlesat" && stats.size < 100) {
            await unlink(filename);
            return null;
          }
          return stats;
        }).catch(() => null);
        queues.stats = performance.now() - statsStart;
        queues.statsCount++;
        if (fileStats) {
          if (!quiet)
            console.log("[cached]", filename);
          res?.sendFile(filename);
          return true;
        }
        if (local) {
          res?.sendStatus(404);
          return false;
        }
        const worthitStart = performance.now();
        if (!quiet || (await Promise.all([
          worthIt({ x, y, z: zoom }),
          worthIt({ x, y: y - 1, z: zoom }),
          worthIt({ x, y: y + 1, z: zoom }),
          worthIt({ x: x - 1, y, z: zoom }),
          worthIt({ x: x - 1, y: y - 1, z: zoom }),
          worthIt({ x: x - 1, y: y + 1, z: zoom }),
          worthIt({ x: x + 1, y, z: zoom }),
          worthIt({ x: x + 1, y: y - 1, z: zoom }),
          worthIt({ x: x + 1, y: y + 1, z: zoom })
        ])).some(Boolean)) {
          const imageStream = await queues.fetch.enqueue(async () => {
            const timeoutController = new globalThis.AbortController();
            const timeoutTimeout = setTimeout(() => timeoutController.abort(), 1e4);
            params.signal = timeoutController.signal;
            const ret = await fetchFromTileServer({ params, provider, url, x, y, z: zoom });
            clearTimeout(timeoutTimeout);
            return ret;
          });
          if (imageStream.body) {
            const writeImageStream = createWriteStream(filename);
            writeImageStream.addListener("finish", () => {
              if (quiet)
                res?.sendStatus(200);
              else
                res?.sendFile(filename);
            });
            imageStream.body.pipe(writeImageStream);
            return true;
          }
          console.log("no imagestream", imageStream.status, { x: (x / max).toFixed(4), y: (y / max).toFixed(4), z: zoom }, url);
          res?.sendStatus(imageStream.status ?? 500);
          return false;
        }
        queues.worthit += performance.now() - worthitStart;
        queues.worthitCount++;
        res?.sendFile(`${pwd}/unworthy.png`);
        return false;
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
async function fetchTile({ dx, dy, provider, ttl, x, y, zoom }) {
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
  childQueue.enqueue(() => fetchTile({ dx: 0, dy: 0, provider, ttl, x, y, zoom }));
  childQueue.enqueue(() => fetchTile({ dx: 0, dy: 1, provider, ttl, x, y, zoom }));
  childQueue.enqueue(() => fetchTile({ dx: 1, dy: 0, provider, ttl, x, y, zoom }));
  childQueue.enqueue(() => fetchTile({ dx: 1, dy: 1, provider, ttl, x, y, zoom }));
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
express().use(express.json()).use(express.urlencoded({ extended: true })).use("", express.static("public")).get("/tile/:provider/:zoom/:x/:y", getTile).listen(port, () => console.log(`backend listener running on port ${port}`)).on("error", (e) => {
  console.error(`cannot start listener on port ${port}`);
  console.log(e);
});
setInterval(printStats, 2e3);
export {
  pwd,
  queues
};
//# sourceMappingURL=index.js.map
