// src/index.ts
import express from "../node_modules/express/index.js";
import { createWriteStream } from "fs";
import { mkdir, stat } from "fs/promises";
import fetch from "../node_modules/node-fetch/src/index.js";

// src/extractProperties.ts
function extractProperties(obj, builder) {
  return Object.entries(builder).reduce((ret, entry) => {
    const [key, constructor] = entry;
    ret[key] = constructor(obj[key]);
    return ret;
  }, {});
}

// src/index.ts
var pwd = "/home/sty/Documents/GitHub/mapsmirror";
var port = 3e3;
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
    const url = {
      osm: `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`
    }[provider] ?? "http://localhost:3000";
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
      res.sendFile(filename);
    } else {
      const timeoutController = new globalThis.AbortController();
      const timeoutTimeout = setTimeout(() => timeoutController.abort(), 1e4);
      const writeImageStream = createWriteStream(filename);
      writeImageStream.addListener("finish", () => {
        if (!quiet)
          console.log("[send]  ", filename);
        res.sendFile(filename);
      });
      console.log("[get]   ", filename);
      try {
        const imageStream = await fetch(url, { signal: timeoutController.signal }).then((response) => response.body).catch(() => {
          res.status(500).json({
            length,
            pathX,
            pathY,
            provider,
            url
          });
        });
        if (imageStream)
          imageStream.pipe(writeImageStream);
      } catch {
      }
      clearTimeout(timeoutTimeout);
    }
    if (ttl > 0) {
      const fetchTile = (dx, dy) => {
        const url2 = `http://localhost:${port}/tile/${provider}/${zoom + 1}/${x * 2 + dx}/${y * 2 + dy}?ttl=${ttl - 1}&quiet=1`;
        return fetch(url2).catch(() => console.log("[failed]", url2));
      };
      fetchTile(0, 0);
      fetchTile(0, 1);
      fetchTile(1, 0);
      fetchTile(1, 1);
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
