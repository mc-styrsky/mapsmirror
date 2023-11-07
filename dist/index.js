// src/server/index.ts
import { StyQueue } from "../node_modules/@mc-styrsky/queue/lib/index.js";
import express from "../node_modules/express/index.js";
import { createWriteStream } from "fs";
import { mkdir, stat, unlink } from "fs/promises";
import fetch2 from "../node_modules/node-fetch/src/index.js";

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
    url: `https://mt1.google.com/vt/lyrs=y&x=${x}&y=${y}&z=${z}`
  };
};

// src/server/urls/googlesat.ts
var xyz2googlesat = async (x, y, z) => {
  if (z > 20)
    return {};
  return {
    url: `https://mt1.google.com/vt/lyrs=s&x=${x}&y=${y}&z=${z}`
  };
};

// src/server/urls/googlestreet.ts
var xyz2googlestreet = async (x, y, z) => {
  if (z > 20)
    return {};
  return {
    url: `https://mt1.google.com/vt/lyrs=m&x=${x}&y=${y}&z=${z}`
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

// src/server/index.ts
var pwd = "/home/sty/Documents/GitHub/mapsmirror";
var port = 3e3;
var queues = {
  quiet: new StyQueue(5),
  verbose: new StyQueue(10)
};
express().use(express.json()).use(express.urlencoded({ extended: true })).use("", express.static("public")).get("/tile/:provider/:zoom/:x/:y", async (req, res) => {
  try {
    const { zoom } = extractProperties(req.params, {
      zoom: (val) => parseInt(String(val))
    });
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
    let fetchChilds = false;
    const { params = {}, url = "" } = await ({
      gebco: xyz2gebco,
      googlehybrid: xyz2googlehybrid,
      googlesat: xyz2googlesat,
      googlestreet: xyz2googlestreet,
      navionics: xyz2navionics,
      osm: xyz2osm
    }[provider] ?? xyz2default)(x, y, zoom);
    const length = 1 + (zoom >> 2);
    const pathX = x.toString(16).padStart(length, "0").split("");
    const pathY = y.toString(16).padStart(length, "0").split("");
    const file = `${pathX.pop()}${pathY.pop()}.png`;
    const path = `tiles/${provider}/${zoom.toString(36)}/${pathX.map((_val, idx) => pathX[idx] + pathY[idx]).join("/")}`;
    await mkdir(path, { recursive: true });
    const filename = `${pwd}/${path}/${file}`;
    const fileStats = await stat(filename).catch(() => null);
    if (fileStats && fileStats.isFile() && fileStats.size > 100) {
      if (!quiet)
        console.log("[cached]", filename);
      fetchChilds = true;
      res.sendFile(filename);
    } else {
      if (fileStats && fileStats.size > 0) {
        console.log("[unlink]", filename);
        await unlink(filename);
      }
      const queue = quiet ? queues.quiet : queues.verbose;
      await queue.enqueue(async () => {
        const timeoutController = new globalThis.AbortController();
        const timeoutTimeout = setTimeout(() => timeoutController.abort(), 1e4);
        console.log("[get]   ", filename);
        try {
          params.signal = timeoutController.signal;
          const imageStream = await fetch2(url, params).then((response) => {
            if (response.status === 200)
              return response.body;
            return null;
          }).catch(() => {
            res.status(500).json({
              length,
              pathX,
              pathY,
              provider,
              url
            });
          });
          if (imageStream) {
            fetchChilds = true;
            const writeImageStream = createWriteStream(filename);
            writeImageStream.addListener("finish", () => {
              if (quiet) {
                console.log("[precached]", queue.length, url);
                res.sendStatus(200);
              } else {
                console.log("[send]  ", filename);
                res.sendFile(filename);
              }
            });
            imageStream.pipe(writeImageStream);
          }
        } catch {
        }
        clearTimeout(timeoutTimeout);
      });
    }
    if (fetchChilds && ttl > 0 && zoom < 17) {
      const fetchTile = async (dx, dy) => {
        const url2 = `http://localhost:${port}/tile/${provider}/${zoom + 1}/${x * 2 + dx}/${y * 2 + dy}?ttl=${ttl - 1}&quiet=1`;
        try {
          return await fetch2(url2);
        } catch {
        }
        return console.log("[failed]", url2);
      };
      Promise.all([
        fetchTile(0, 0),
        fetchTile(0, 1),
        fetchTile(1, 0),
        fetchTile(1, 1)
      ]);
    }
  } catch (e) {
    console.error(e);
    res.status(500).send("internal server error");
  }
}).listen(port, () => console.log(`backend listener running on port ${port}`)).on("error", (e) => {
  console.error(`cannot start listener on port ${port}`);
  console.log(e);
});
//# sourceMappingURL=index.js.map
