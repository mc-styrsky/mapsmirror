// src/server/index.ts
import { StyQueue } from "../node_modules/@mc-styrsky/queue/lib/index.js";
import express from "../node_modules/express/index.js";

// src/common/consts.ts
var port = 3e3;

// src/server/requestHandler/getTile.ts
import { createWriteStream } from "fs";
import { mkdir, stat } from "fs/promises";
import fetch2 from "../node_modules/node-fetch/src/index.js";
import { Readable } from "stream";

// src/common/extractProperties.ts
function extractProperties(obj, builder) {
  return Object.entries(builder).reduce((ret, entry) => {
    const [key, constructor] = entry;
    ret[key] = constructor(obj[key]);
    return ret;
  }, {});
}

// src/server/urls/default.ts
var xyz2default = async () => ({});

// src/server/urls/gebco.ts
var xyz2gebco = async (x, y, z) => {
  if (z > 9)
    return {};
  return {
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
  if (z > 19)
    return {};
  return {
    url: `https://tile.openstreetmap.org/${z}/${x}/${y}.png`
  };
};

// src/server/utils/getTileParams.ts
var getTileParams = ({ x, y, z }) => {
  const length = z + 3 >> 2;
  const pathX = x.toString(16).padStart(length, "0").split("");
  const pathY = y.toString(16).padStart(length, "0").split("");
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
var worthItDatabase = {};
var populateDatabase = (z, base, func) => {
  worthItDatabase[`${z.toString(36)}/${func}`] = base;
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
populateDatabase(0, await sharp("tiles/gebco/0/00.png").greyscale().toFormat("raw").toBuffer(), "max");
populateDatabase(0, await sharp("tiles/gebcomin/0/00.png").greyscale().toFormat("raw").toBuffer(), "min");
console.log(worthItDatabase);
var worthIt = async ({ x, y, z }) => {
  if (z > 17) {
    x = x >> z - 17;
    y = y >> z - 17;
    z = 17;
  }
  if (y >= (1 << z) / 4 * 3)
    return false;
  const { tileId } = getTileParams({ x, y, z });
  const tileParts = tileId.split("/");
  tileParts.pop();
  tileParts.pop();
  const path = `${(z - 8).toString(36)}/${tileParts.join("/")}`;
  worthItDatabase[`${path}max`] ||= await sharp(`tiles/gebco/${path}.png`).greyscale().toFormat("raw").toBuffer();
  worthItDatabase[`${path}min`] ||= await sharp(`tiles/gebcomin/${path}.png`).greyscale().toFormat("raw").toBuffer();
  const tileMax = worthItDatabase[`${path}max`];
  const tileMin = worthItDatabase[`${path}min`];
  const pos = (x & 255) + (y & 255) * 256;
  const max = tileMax[pos];
  const min = tileMin[pos];
  return max > 96 && min < 144;
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
      const ret2 = parseInt(String(val), 16) % max;
      return ret2 < 0 ? ret2 + max : ret2;
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
    const ret = await queue.enqueue(async () => {
      let fetchChilds = null;
      const { params = {}, url = "" } = await ({
        gebco: xyz2gebco,
        googlehybrid: xyz2googlehybrid,
        googlesat: xyz2googlesat,
        googlestreet: xyz2googlestreet,
        navionics: xyz2navionics,
        osm: xyz2osm
      }[provider] ?? xyz2default)(x, y, zoom);
      if (!url) {
        fetchChilds = false;
        res?.sendStatus(404);
        return fetchChilds;
      }
      const { tileFileId, tileId, tilePath } = getTileParams({ x, y, z: zoom });
      if (!(await Promise.all([
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
        res?.sendFile(`${pwd}/unworthy.png`);
        fetchChilds = false;
        return fetchChilds;
      }
      const file = `${tileFileId}.png`;
      const path = `tiles/${provider}/${zoom.toString(36)}/${tilePath}`;
      await mkdir(path, { recursive: true });
      const filename = `${pwd}/${path}/${file}`;
      const fileStats = await stat(filename).catch(() => null);
      if (fileStats && fileStats.isFile()) {
        if (fileStats.size > 100) {
          if (!quiet)
            console.log("[cached]", filename);
          fetchChilds = true;
          res?.sendFile(filename);
        } else {
          fetchChilds = false;
          res?.sendStatus(404);
        }
      } else {
        const timeoutController = new globalThis.AbortController();
        const timeoutTimeout = setTimeout(() => timeoutController.abort(), 1e4);
        try {
          params.signal = timeoutController.signal;
          const imageStream = await fetch2(url, params).then((response) => {
            if (response.status === 200)
              return {
                body: response.body,
                status: response.status
              };
            if (response.status === 404)
              return {
                body: Readable.from(""),
                status: response.status
              };
            return {
              body: null,
              status: response.status
            };
          }).catch(() => {
            res?.status(500).json({
              provider,
              tileId,
              url
            });
            return {
              body: null,
              status: 500
            };
          });
          if (imageStream.body) {
            fetchChilds = true;
            const writeImageStream = createWriteStream(filename);
            writeImageStream.addListener("finish", () => {
              if (quiet)
                res?.sendStatus(200);
              else
                res?.sendFile(filename);
            });
            imageStream.body.pipe(writeImageStream);
          } else {
            console.log("no imagestream", { x: (x / max).toFixed(4), y: (y / max).toFixed(4), z: zoom }, url);
            if (imageStream.status === 404)
              res?.sendStatus(imageStream.status);
          }
        } catch (e) {
          console.log(e);
        }
        clearTimeout(timeoutTimeout);
      }
      if (fetchChilds && ttl > 0 && zoom < 22 && provider !== "gebco") {
        const fetchTile = async (dx, dy) => {
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
        };
        fetchTile(0, 0);
        fetchTile(0, 1);
        fetchTile(1, 0);
        fetchTile(1, 1);
      }
      return fetchChilds;
    });
    return ret;
  } catch (e) {
    console.error(e);
    res?.status(500).send("internal server error");
    return null;
  }
};

// src/server/index.ts
var pwd = "/home/sty/Documents/GitHub/mapsmirror";
var queues = {
  quiet: new StyQueue(10),
  verbose: new StyQueue(10)
};
express().use(express.json()).use(express.urlencoded({ extended: true })).use("", express.static("public")).get("/tile/:provider/:zoom/:x/:y", getTile).listen(port, () => console.log(`backend listener running on port ${port}`)).on("error", (e) => {
  console.error(`cannot start listener on port ${port}`);
  console.log(e);
});
var maxzoom = -1;
var getMaxzoom = () => maxzoom;
var setMaxzoom = (z) => maxzoom = z;
setInterval(() => {
  console.log({
    maxzoom,
    quite: queues.quiet.length,
    verbose: queues.verbose.length
  });
}, 2e3);
export {
  getMaxzoom,
  pwd,
  queues,
  setMaxzoom
};
//# sourceMappingURL=index.js.map
