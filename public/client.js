// src/client/utils/createHTMLElement.ts
function createHTMLElement(params) {
  const { classes, dataset, style, tag, zhilds, ...data } = params;
  const element = document.createElement(tag);
  Object.entries(data).forEach(([k, v]) => element[k] = v);
  if (classes)
    classes.forEach((c) => element.classList.add(c));
  if (dataset)
    Object.entries(dataset).forEach(([k, v]) => element.dataset[k] = v);
  if (style)
    Object.entries(style).forEach(([k, v]) => element.style[k] = v);
  if (zhilds)
    zhilds.forEach((child) => {
      if (!child)
        return;
      if (typeof child === "string")
        element.append(document.createTextNode(child));
      else
        element.append(child);
    });
  return element;
}

// src/client/containers/infoBox.ts
var infoBox = createHTMLElement({
  classes: ["float-end"],
  style: {
    backgroundColor: "#80808080",
    borderBottomLeftRadius: "1em",
    padding: "0.3em"
  },
  tag: "div",
  zhilds: []
});

// src/client/containers/mapContainer.ts
var mapContainer = createHTMLElement({
  style: {
    left: "0px",
    position: "absolute",
    top: "0px",
    zIndex: "-200"
  },
  tag: "div",
  zhilds: []
});

// src/client/globals/settings.ts
var order = [
  "osm",
  "openseamap",
  "navionics",
  { alpha: 0.5, source: "vfdensity" }
];
var settings = {
  tiles: {
    baselayers: [
      "",
      "osm",
      "googlesat",
      "googlestreet",
      "googlehybrid",
      "gebco",
      "bingsat",
      "bluemarble"
    ],
    enabled: Object.fromEntries(order.map((e) => typeof e === "string" ? e : e.source).filter((e) => e !== "openseamap").map((e) => [e, true])),
    order
  }
};

// src/common/extractProperties.ts
function extractProperties(obj, builder) {
  return Object.entries(builder).reduce((ret, entry) => {
    const [key, constructor] = entry;
    ret[key] = constructor(obj[key]);
    return ret;
  }, {});
}

// src/client/globals/position.ts
var { ttl, x, y, z } = extractProperties(Object.fromEntries(new URL(window.location.href).searchParams.entries()), {
  ttl: (val) => parseInt(val ?? 0),
  x: (val) => parseFloat(val ?? 2),
  y: (val) => parseFloat(val ?? 2),
  z: (val) => parseInt(val ?? 2)
});
var position = {
  map: { x, y, z },
  show: { crosshair: true },
  tiles: 1 << z,
  ttl,
  user: {
    accuracy: 0,
    latitude: 0,
    longitude: 0,
    timestamp: 0
  },
  x,
  y,
  z
};

// src/client/sphericCircle.ts
var sphericCircle = (lat, lon, radius, steps = 256) => {
  const sinRadius = Math.sin(radius);
  const cosRadius = Math.cos(radius);
  const sinLat = Math.sin(lat);
  const cosLat = Math.cos(lat);
  const pi2 = Math.PI * 2;
  const points = [];
  for (let step = 0; step <= steps; step++) {
    const omega = step / steps * pi2;
    const { lat2, lon2 } = sphericLatLon({ cosLat, cosRadius, lat, omega, radius, sinLat, sinRadius });
    if (step === 0)
      points.push([lat2, lon + Math.abs(lon2), false]);
    else if (step === steps / 2) {
      points.push([lat2, lon + Math.abs(lon2), true]);
      points.push([lat2, lon - Math.abs(lon2), false]);
    } else if (step === steps)
      points.push([lat2, lon - Math.abs(lon2), true]);
    else
      points.push([lat2, lon + lon2, true]);
  }
  return points;
};
var sphericLatLon = ({ cosLat, cosRadius, lat, omega, radius, sinLat, sinRadius }) => {
  sinRadius ??= Math.sin(radius);
  cosRadius ??= Math.cos(radius);
  sinLat ??= Math.sin(lat);
  cosLat ??= Math.cos(lat);
  const pi2 = 2 * Math.PI;
  const lonSign = omega - pi2 * Math.floor(omega / pi2) > Math.PI ? -1 : 1;
  const sinLat2 = Math.max(-1, Math.min(Math.cos(omega) * cosLat * sinRadius + sinLat * cosRadius, 1));
  const lat2 = Math.asin(sinLat2);
  const cosLat2 = Math.sqrt(1 - sinLat2 * sinLat2);
  const cosLon2 = Math.max(-1, Math.min((cosRadius - sinLat * sinLat2) / cosLat / cosLat2, 1));
  const lon2 = Math.acos(cosLon2) * lonSign;
  const cosOmega2 = (sinLat - sinLat2 * cosRadius) / (cosLat2 * sinRadius);
  return { cosOmega2, lat2, lon2 };
};

// src/client/utils/frac.ts
var frac = (x2) => x2 - Math.floor(x2);

// src/client/utils/lat2y.ts
var lat2y = (lat, tiles = position.tiles) => {
  return (0.5 - Math.asinh(Math.tan(lat)) / Math.PI / 2) * tiles;
};

// src/client/utils/lon2x.ts
var lon2x = (lon, tiles = position.tiles) => (lon / Math.PI / 2 + 0.5) * tiles;

// src/client/utils/min2rad.ts
var min2rad = (min) => min / 60 / 180 * Math.PI;

// src/client/utils/nm2px.ts
var nm2px = (lat) => {
  const stretch = 1 / Math.cos(lat);
  return position.tiles * tileSize / 360 / 60 * stretch;
};

// src/client/utils/x2lon.ts
var x2lon = (x2, tiles = position.tiles) => (x2 / tiles - 0.5) * Math.PI * 2;

// src/client/utils/y2lat.ts
var y2lat = (y2, tiles = position.tiles) => Math.asin(Math.tanh((0.5 - y2 / tiles) * 2 * Math.PI));

// src/client/canvases/crosshairs.ts
var createCrosshairsCanvas = ({
  height,
  width,
  x: x2,
  y: y2
}) => {
  const canvas = createHTMLElement({
    height,
    style: {
      height: `${height}px`,
      position: "absolute",
      width: `${width}px`
    },
    tag: "canvas",
    width
  });
  const context = canvas.getContext("2d");
  if (!position.show.crosshair || !context)
    return canvas;
  const lat = y2lat(y2);
  const lon = x2lon(x2);
  const milesPerTile = 100 / nm2px(lat);
  const scale = Math.log10(milesPerTile);
  const scaleFloor = Math.floor(scale);
  const scaleFrac = frac(scale);
  const milesPerArc = Math.pow(10, scaleFloor) * (scaleFrac < 0.3 ? 1 : scaleFrac > 0.7 ? 5 : 2);
  const milesPerDiv = milesPerArc / 10;
  context.translate(width / 2, height / 2);
  let minLast = 0;
  context.beginPath();
  context.strokeStyle = "#ff0000";
  context.moveTo(-5, 5);
  context.lineTo(5, -5);
  context.moveTo(5, 5);
  context.lineTo(-5, -5);
  context.stroke();
  for (let minArc = milesPerArc; minArc < 10800; minArc += milesPerArc) {
    const radiusX = nm2px(lat) * minArc;
    if (radiusX > canvas.width)
      break;
    const radDiv = min2rad(minArc);
    const circlePoints = sphericCircle(lat, lon, radDiv).map(([latPoint, lonPoint, draw]) => ({
      draw,
      tx: (lon2x(lonPoint) - x2) * tileSize,
      ty: (lat2y(latPoint) - y2) * tileSize
    }));
    context.beginPath();
    context.strokeStyle = "#ff0000";
    circlePoints.forEach(({ draw, tx, ty }, idx) => {
      if (draw)
        context.lineTo(tx, ty);
      else
        context.moveTo(tx, ty);
      if (idx === 32)
        context.strokeText(`${minArc.toFixed(Math.max(0, -scaleFloor))}nm`, tx, ty);
    });
    context.stroke();
    const piHalf = Math.PI / 2;
    context.beginPath();
    for (let minDiv = minLast + milesPerDiv; minDiv < minArc; minDiv += milesPerDiv) {
      const radDiv2 = min2rad(minDiv);
      if (lat + radDiv2 < piHalf) {
        const top = (lat2y(lat + radDiv2) - y2) * tileSize;
        context.moveTo(-5, top);
        context.lineTo(5, top);
      }
      if (lat - radDiv2 > -piHalf) {
        const bottom = (lat2y(lat - radDiv2) - y2) * tileSize;
        context.moveTo(-5, bottom);
        context.lineTo(5, bottom);
      }
      const { cosOmega2, lat2, lon2 } = sphericLatLon({ lat, omega: piHalf, radius: radDiv2 });
      const sinOmega2 = Math.sqrt(1 - cosOmega2 * cosOmega2);
      context.moveTo(
        (lon2x(lon + lon2) - x2) * tileSize + cosOmega2 * 5,
        (lat2y(lat2) - y2) * tileSize - sinOmega2 * 5
      );
      context.lineTo(
        (lon2x(lon + lon2) - x2) * tileSize - cosOmega2 * 5,
        (lat2y(lat2) - y2) * tileSize + sinOmega2 * 5
      );
      context.moveTo(
        (lon2x(lon - lon2) - x2) * tileSize - cosOmega2 * 5,
        (lat2y(lat2) - y2) * tileSize - sinOmega2 * 5
      );
      context.lineTo(
        (lon2x(lon - lon2) - x2) * tileSize + cosOmega2 * 5,
        (lat2y(lat2) - y2) * tileSize + sinOmega2 * 5
      );
      context.strokeStyle = "#ff0000";
    }
    context.stroke();
    minLast = minArc;
  }
  return canvas;
};

// src/client/globals/mouse.ts
var mouse = {
  down: false,
  x: 0,
  y: 0
};

// src/client/utils/px2nm.ts
var px2nm = (lat) => {
  const stretch = 1 / Math.cos(lat);
  return 360 * 60 / position.tiles / tileSize / stretch;
};

// src/client/globals/units.ts
var units = {
  coords: "dm"
};

// src/client/utils/rad2deg.ts
var func = {
  d: ({ axis = " -", pad = 0, phi }) => {
    let deg = Math.round(phi * 180 / Math.PI % 360 * 1e5) / 1e5;
    while (deg > 180)
      deg -= 360;
    while (deg < -180)
      deg += 360;
    return `${axis[deg < 0 ? 1 : 0] ?? ""}${(deg < 0 ? -deg : deg).toFixed(5).padStart(pad + 6, "0")}\xB0`;
  },
  dm: ({ axis = " -", pad = 0, phi }) => {
    let deg = Math.round(phi * 180 / Math.PI % 360 * 6e4) / 6e4;
    while (deg > 180)
      deg -= 360;
    while (deg < -180)
      deg += 360;
    const degrees = deg | 0;
    const minutes = (Math.abs(deg) - Math.abs(degrees)) * 60;
    return `${axis[deg < 0 ? 1 : 0] ?? ""}${(deg < 0 ? -degrees : degrees).toFixed(0).padStart(pad, "0")}\xB0${minutes.toFixed(3).padStart(6, "0")}'`;
  },
  dms: ({ axis = " -", pad = 0, phi }) => {
    let deg = Math.round(phi * 180 / Math.PI % 360 * 36e4) / 36e4;
    while (deg > 180)
      deg -= 360;
    while (deg < -180)
      deg += 360;
    const degrees = deg | 0;
    const min = Math.round((Math.abs(deg) - Math.abs(degrees)) * 36e4) / 6e3;
    const minutes = min | 0;
    const seconds = (min - minutes) * 60;
    return `${axis[deg < 0 ? 1 : 0] ?? ""}${(deg < 0 ? -degrees : degrees).toFixed(0).padStart(pad, "0")}\xB0${minutes.toFixed(0).padStart(2, "0")}'${seconds.toFixed(2).padStart(5, "0")}"`;
  }
};
var rad2deg = ({ axis = " -", pad = 0, phi }) => func[units.coords]({ axis, pad, phi });

// src/client/updateInfoBox.ts
var updateInfoBox = () => {
  if (!container)
    return;
  const { height, width } = container.getBoundingClientRect();
  const lat = y2lat(position.y);
  const lon = x2lon(position.x);
  const latMouse = y2lat(position.y + (mouse.y - height / 2) / tileSize);
  const lonMouse = x2lon(position.x + (mouse.x - width / 2) / tileSize);
  const scale = (() => {
    let nm = px2nm(lat);
    let px = 1;
    if (nm >= 1)
      return `${px2nm(lat).toPrecision(3)}nm/px`;
    while (nm < 1) {
      nm *= 10;
      px *= 10;
    }
    return `${nm.toPrecision(3)}nm/${px.toFixed(0)}px`;
  })();
  infoBox.innerHTML = "";
  infoBox.append(
    `Scale: ${scale} (Zoom ${position.z})`,
    createHTMLElement({ tag: "br" }),
    `Lat/Lon: ${rad2deg({ axis: "NS", pad: 2, phi: lat })} ${rad2deg({ axis: "EW", pad: 3, phi: lon })}`,
    createHTMLElement({ tag: "br" }),
    `Mouse: ${rad2deg({ axis: "NS", pad: 2, phi: latMouse })} ${rad2deg({ axis: "EW", pad: 3, phi: lonMouse })}`,
    createHTMLElement({ tag: "br" }),
    `User: ${rad2deg({ axis: "NS", pad: 2, phi: position.user.latitude })} ${rad2deg({ axis: "EW", pad: 3, phi: position.user.longitude })} (@${new Date(position.user.timestamp).toLocaleTimeString()})`,
    ...imagesToFetch.stateHtml()
  );
};

// src/client/utils/imagesToFetch.ts
var ImagesToFetch = class {
  constructor() {
  }
  xyz2string = ({ x: x2, y: y2, z: z2 }) => `${z2.toString(16)}_${x2.toString(16)}_${y2.toString(16)}`;
  data = {};
  total = {};
  getSet = (source) => this.data[source] ??= /* @__PURE__ */ new Set();
  add = ({ source, ...xyz }) => {
    this.getSet(source).add(this.xyz2string(xyz));
    this.total[source] = (this.total[source] ?? 0) + 1;
    updateInfoBox();
  };
  delete = ({ source, ...xyz }) => {
    this.getSet(source).delete(this.xyz2string(xyz));
    if (this.getSet(source).size === 0)
      delete this.data[source];
    updateInfoBox();
  };
  reset = () => {
    this.total = {};
  };
  state = () => {
    return Object.entries(this.data).map(([key, val]) => [key, val.size]);
  };
  stateHtml = () => {
    return this.state().reduce(
      (arr, [source, size]) => {
        arr.push(createHTMLElement({ tag: "br" }));
        arr.push(`${source}: ${size}/${this.total[source]}`);
        return arr;
      },
      []
    );
  };
};
var imagesToFetch = new ImagesToFetch();

// src/client/canvases/map/drawImage.ts
var drawImage = ({
  context,
  scale = 1,
  source,
  ttl: ttl2,
  x: x2,
  y: y2,
  z: z2
}) => {
  const src = `/tile/${source}/${[
    z2,
    Math.floor(x2 / scale).toString(16),
    Math.floor(y2 / scale).toString(16)
  ].join("/")}?ttl=${ttl2}`;
  const sx = Math.floor(frac(x2 / scale) * scale) * tileSize / scale;
  const sy = Math.floor(frac(y2 / scale) * scale) * tileSize / scale;
  const sw = tileSize / scale;
  imagesToFetch.add({ source, x: x2, y: y2, z: z2 });
  const img = new Image();
  img.src = src;
  const prom = new Promise((resolve) => {
    img.onload = () => {
      context.drawImage(
        img,
        sx,
        sy,
        sw,
        sw,
        0,
        0,
        tileSize,
        tileSize
      );
      resolve(true);
      imagesToFetch.delete({ source, x: x2, y: y2, z: z2 });
    };
    img.onerror = () => {
      resolve(
        z2 > 0 ? drawImage({
          context,
          scale: scale << 1,
          source,
          ttl: ttl2,
          x: x2,
          y: y2,
          z: z2 - 1
        }) : false
      );
      imagesToFetch.delete({ source, x: x2, y: y2, z: z2 });
    };
  });
  return prom;
};

// src/client/canvases/map/navionicsWatermark.ts
var navionicsWatermark = (async () => {
  const img = new Image();
  img.src = "/navionicsWatermark.png";
  const cnvs = new OffscreenCanvas(256, 256);
  const ctx = cnvs.getContext("2d");
  if (!ctx)
    return null;
  return new Promise((resolve) => {
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      resolve(ctx.getImageData(0, 0, tileSize, tileSize).data);
    };
    img.onerror = () => {
      ctx.beginPath();
      ctx.fillStyle = "#f8f8f8f8";
      ctx.strokeStyle = "#f8f8f8f8";
      ctx.fillRect(0, 0, tileSize, tileSize);
      ctx.fill();
      ctx.stroke();
      resolve(ctx.getImageData(0, 0, tileSize, tileSize).data);
    };
  });
})().then((watermark) => {
  if (!watermark)
    return null;
  const ret = new Uint8ClampedArray(tileSize * tileSize);
  for (let i = 0; i < ret.length; i++) {
    ret[i] = watermark[i * 4];
  }
  return ret;
});

// src/client/canvases/map/drawNavionics.ts
var backgroundColors = [
  2142456,
  5818616,
  6867192,
  8442104,
  10541304,
  11067640,
  11591928,
  12642552,
  16316664
].reduce((arr, val) => {
  const r = val >> 16;
  const g = val >> 8 & 255;
  const b = val & 255;
  const diff = 2;
  for (let dr = -diff; dr <= diff; dr++) {
    for (let dg = -diff; dg <= diff; dg++) {
      for (let db = -diff; db <= diff; db++) {
        arr.add((r + dr << 16) + (g + dg << 8) + b + db);
      }
    }
  }
  return arr;
}, /* @__PURE__ */ new Set());
var drawNavionics = async ({ context, source, ttl: ttl2, x: x2, y: y2, z: z2 }) => {
  const workerCanvas = new OffscreenCanvas(tileSize, tileSize);
  const workerContext = workerCanvas.getContext("2d");
  const watermark = await navionicsWatermark;
  if (!workerContext || !watermark)
    return false;
  const drawProm = drawImage({ context: workerContext, source, ttl: ttl2, x: x2, y: y2, z: z2 });
  const draw = await drawProm;
  if (!draw)
    return false;
  imagesToFetch.add({ source: "transparent", x: x2, y: y2, z: z2 });
  const img = workerContext.getImageData(0, 0, tileSize, tileSize);
  const { data } = img;
  for (let i = 0; i < watermark.length; i++) {
    const mask = watermark[i];
    const [r, g, b] = data.subarray(i * 4, i * 4 + 3).map((v) => v * 248 / mask);
    const color = (r << 16) + (g << 8) + b;
    if (color === 10012672)
      data[i * 4 + 3] = 64;
    else if (backgroundColors.has(color))
      data[i * 4 + 3] = 0;
  }
  workerContext.putImageData(img, 0, 0);
  imagesToFetch.delete({ source: "transparent", x: x2, y: y2, z: z2 });
  context.drawImage(workerCanvas, 0, 0);
  return true;
};

// src/client/canvases/map/drawCachedImage.ts
var drawCachedImage = async ({
  alpha,
  context,
  source,
  trans,
  ttl: ttl2,
  usedImages,
  x: x2,
  y: y2,
  z: z2
}) => {
  const isNavionics = source === "navionics";
  const src = `/${source}/${[
    z2,
    x2.toString(16),
    y2.toString(16)
  ].join("/")}`;
  const drawCanvas = (cnvs) => {
    usedImages.add(src);
    context.globalAlpha = alpha;
    context.drawImage(
      cnvs,
      x2 * tileSize + trans.x,
      y2 * tileSize + trans.y
    );
  };
  const cachedCanvas = await imagesMap[src];
  if (cachedCanvas)
    return () => {
      console.log(`used cached ${src}`);
      drawCanvas(cachedCanvas);
      return Promise.resolve(true);
    };
  const workerCanvas = new OffscreenCanvas(tileSize, tileSize);
  const workerContext = workerCanvas.getContext("2d");
  if (!workerContext)
    return () => Promise.resolve(true);
  const successProm = isNavionics ? drawNavionics({ context: workerContext, source, ttl: ttl2, x: x2, y: y2, z: z2 }) : drawImage({ context: workerContext, source, ttl: ttl2, x: x2, y: y2, z: z2 });
  imagesMap[src] = successProm.then((success) => success ? workerCanvas : null);
  return async () => {
    const success = await successProm;
    if (success) {
      drawCanvas(workerCanvas);
    }
    return success;
  };
};

// src/client/canvases/mapCanvas.ts
var imagesMap = {};
var createMapCanvas = async ({
  height,
  width,
  x: x2,
  y: y2,
  z: z2
}) => {
  const canvasWidth = width + 2 * tileSize;
  const canvasHeight = height + 2 * tileSize;
  const canvas = createHTMLElement({
    style: {
      height: `${canvasHeight}px`,
      left: `${-tileSize}px`,
      position: "absolute",
      top: `${-tileSize}px`,
      width: `${canvasWidth}px`
    },
    tag: "canvas"
  });
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const context = canvas.getContext("2d");
  if (!context)
    return canvas;
  context.translate(tileSize, tileSize);
  const trans = {
    x: Math.round(width / 2 - x2 * tileSize),
    y: Math.round(height / 2 - y2 * tileSize)
  };
  const maxdx = Math.ceil((width - trans.x) / tileSize);
  const maxdy = Math.ceil((height - trans.y) / tileSize);
  const mindx = -Math.ceil(trans.x / tileSize);
  const mindy = -Math.ceil(trans.y / tileSize);
  const dxArray = [];
  for (let dx = mindx; dx < maxdx; dx++)
    dxArray.push(dx);
  const dyArray = [];
  for (let dy = mindy; dy < maxdy; dy++) {
    if (dy >= 0 && dy < position.tiles)
      dyArray.push(dy);
  }
  const usedImages = /* @__PURE__ */ new Set();
  const ttl2 = Math.max(Math.min(17, z2 + Math.max(0, position.ttl)) - z2, 0);
  await Promise.all(dxArray.map(async (dx) => {
    await Promise.all(dyArray.map((dy) => {
      return settings.tiles.order.reduce(async (prom, entry) => {
        const { alpha, source } = typeof entry === "string" ? { alpha: 1, source: entry } : entry;
        if (source && settings.tiles.enabled[source]) {
          const draw = drawCachedImage({ alpha, context, source, trans, ttl: ttl2, usedImages, x: dx, y: dy, z: z2 });
          await prom;
          await (await draw)();
          console.log("drawed", { dx, dy, source, z: z2 });
        }
        return prom;
      }, Promise.resolve());
    }));
  })).then(() => {
    Object.keys(imagesMap).forEach((src) => {
      if (!usedImages.has(src))
        delete imagesMap[src];
    });
  });
  return canvas;
};

// src/client/canvases/net.ts
var scales = [
  0.1,
  0.2,
  0.5,
  1,
  2,
  5,
  10,
  15,
  20,
  30,
  60,
  2 * 60,
  5 * 60,
  10 * 60,
  15 * 60,
  20 * 60,
  30 * 60,
  45 * 60
];
var getScale = (lat, minPx = 100) => {
  const target = px2nm(lat) * minPx;
  return min2rad(scales.reduce((prev, curr) => {
    return prev > target ? prev : curr;
  }, scales[0]));
};
var createNetCanvas = ({
  height,
  width,
  x: x2,
  y: y2
}) => {
  const canvas = createHTMLElement({
    height,
    style: {
      height: `${height}px`,
      position: "absolute",
      width: `${width}px`
    },
    tag: "canvas",
    width
  });
  const context = canvas.getContext("2d");
  if (!context)
    return canvas;
  context.translate(width / 2, height / 2);
  const lat = y2lat(y2);
  const scaleX = getScale(0, context.measureText(rad2deg({ axis: "WW", pad: 3, phi: 0 })).width);
  const scaleY = getScale(lat);
  const left = x2 - width / 2 / tileSize;
  const right = x2 + width / 2 / tileSize;
  const top = y2 - height / 2 / tileSize;
  const bottom = y2 + height / 2 / tileSize;
  const strokeText = (text, x3, y3) => {
    context.strokeText(text, x3, y3);
    context.fillText(text, x3, y3);
  };
  const latTop = Math.floor(y2lat(top) / scaleY) * scaleY;
  const latBottom = Math.ceil(y2lat(bottom) / scaleY) * scaleY;
  const pointsY = [];
  for (let ctr = 0; ctr < 1e3; ctr++) {
    const latGrid = latTop - scaleY * ctr;
    if (latGrid < latBottom)
      break;
    pointsY.push({
      latGrid,
      x1: (left - x2) * tileSize,
      x2: (right - x2) * tileSize,
      y1: (lat2y(latGrid) - y2) * tileSize
    });
  }
  const lonLeft = Math.floor(x2lon(left) / scaleX) * scaleX;
  const lonRight = Math.ceil(x2lon(right) / scaleX) * scaleX;
  const pointsX = [];
  for (let ctr = 0; ctr < 1e3; ctr++) {
    const lonGrid = lonLeft + scaleX * ctr;
    if (lonGrid > lonRight)
      break;
    pointsX.push({
      lonGrid,
      x1: (lon2x(lonGrid) - x2) * tileSize,
      y1: (top - y2) * tileSize,
      y2: (bottom - y2) * tileSize
    });
  }
  context.beginPath();
  context.strokeStyle = "#808080";
  pointsY.forEach(({ x1, x2: x22, y1 }) => {
    context.moveTo(x1, y1);
    context.lineTo(x22, y1);
  });
  pointsX.forEach(({ x1, y1, y2: y22 }) => {
    context.moveTo(x1, y1);
    context.lineTo(x1, y22);
  });
  context.stroke();
  context.beginPath();
  context.strokeStyle = "#ffffff";
  context.fillStyle = "#000000";
  context.lineWidth = 3;
  pointsY.forEach(({ latGrid, x1, y1 }) => {
    strokeText(
      rad2deg({ axis: "NS", pad: 2, phi: latGrid }),
      x1 + 3,
      y1 - 3
    );
  });
  pointsX.forEach(({ lonGrid, x1, y1 }) => {
    strokeText(
      rad2deg({ axis: "EW", pad: 3, phi: lonGrid }),
      x1 + 3,
      y1 - 3
    );
  });
  context.fill();
  context.stroke();
  return canvas;
};

// src/client/containers/overlayContainer.ts
var overlayContainer = createHTMLElement({
  style: {
    left: "0px",
    position: "absolute",
    top: "0px",
    zIndex: "-100"
  },
  tag: "div",
  zhilds: []
});

// src/client/redraw.ts
var working = false;
var newWorker = false;
function moveCanvas({ canvas, height, width, x: x2, y: y2, z: z2 }) {
  const scaleZ = z2 >= position.map.z ? 1 << z2 - position.map.z : 1 / (1 << position.map.z - z2);
  const shiftX = (position.map.x * scaleZ - x2) * tileSize;
  const shiftY = (position.map.y * scaleZ - y2) * tileSize;
  canvas.style.height = `${scaleZ * canvas.height}px`;
  canvas.style.width = `${scaleZ * canvas.width}px`;
  canvas.style.left = `${(width - canvas.width * scaleZ) / 2 + shiftX}px`;
  canvas.style.top = `${(height - canvas.height * scaleZ) / 2 + shiftY}px`;
}
var map = null;
var redraw = async (type) => {
  if (!container)
    return;
  const { height, width } = container.getBoundingClientRect();
  const { tiles, x: x2, y: y2, z: z2 } = position;
  const crosshairs = createCrosshairsCanvas({ height, width, x: x2, y: y2 });
  const net = createNetCanvas({ height, width, x: x2, y: y2 });
  overlayContainer.innerHTML = "";
  overlayContainer.append(crosshairs, net);
  updateInfoBox();
  if (map)
    moveCanvas({ canvas: map, height, width, x: x2, y: y2, z: z2 });
  await new Promise((r) => setTimeout(r, 1));
  if (working) {
    if (newWorker)
      return;
    newWorker = true;
    setTimeout(() => {
      newWorker = false;
      redraw(type);
    }, 10);
    return;
  }
  working = true;
  newWorker = false;
  console.log(`${type} redraw@${(/* @__PURE__ */ new Date()).toISOString()}`);
  await createMapCanvas({ height, width, x: x2, y: y2, z: z2 }).then((newCanvas) => {
    if (!container)
      return;
    position.x = (position.x + position.tiles) % position.tiles;
    map = newCanvas;
    position.map.x = (x2 + tiles) % tiles;
    position.map.y = y2;
    position.map.z = z2;
    mapContainer.innerHTML = "";
    mapContainer.append(newCanvas);
  });
  const newlocation = `${window.location.origin}${window.location.pathname}?z=${z2}&${Object.entries({ ttl: position.ttl, x: position.x, y: y2 }).map(([k, v]) => `${k}=${v}`).join("&")}`;
  window.history.pushState({ path: newlocation }, "", newlocation);
  imagesToFetch.reset();
  setTimeout(() => working = false, 100);
};

// src/client/containers/menu/baselayerMenu.ts
var baselayerMenuButton = createHTMLElement({
  classes: ["btn", "btn-secondary", "dropdown-toggle"],
  dataset: {
    bsToggle: "dropdown"
  },
  role: "button",
  tag: "a",
  zhilds: ["Baselayer"]
});
var setBaseLayer = (source) => {
  settings.tiles.baselayers.forEach((key) => settings.tiles.enabled[key] = key === source);
  settings.tiles.order[0] = source;
  baselayerMenuButton.innerText = source;
  redraw("changed baselayer");
};
var baselayerMenu = createHTMLElement({
  classes: ["dropdown"],
  tag: "div",
  zhilds: [
    baselayerMenuButton,
    createHTMLElement({
      classes: ["dropdown-menu"],
      tag: "ul",
      zhilds: [
        createHTMLElement({
          tag: "li",
          zhilds: settings.tiles.baselayers.map((source) => {
            return createHTMLElement({
              classes: ["dropdown-item"],
              onclick: () => setBaseLayer(source),
              tag: "a",
              zhilds: [source || "- none -"]
            });
          })
        })
      ]
    })
  ]
});

// src/client/containers/menu/coordsToggle.ts
var coordsToggle = createHTMLElement({
  classes: ["btn", "btn-secondary"],
  onclick: () => {
    units.coords = {
      d: "dm",
      dm: "dms",
      dms: "d"
    }[units.coords] ?? "dm";
    coordsToggle.innerText = {
      d: "Dec",
      dm: "D\xB0M'",
      dms: "DMS"
    }[units.coords];
    redraw("coords changed");
  },
  role: "button",
  tag: "a",
  zhilds: [{
    d: "Dec",
    dm: "D\xB0M'",
    dms: "DMS"
  }[units.coords]]
});

// src/client/containers/menu/iconButton.ts
var iconButton = ({ active, onclick, src }) => {
  const ret = createHTMLElement({
    classes: ["btn", active() ? "btn-success" : "btn-secondary"],
    role: "button",
    style: {
      padding: "0.25rem"
    },
    tag: "a",
    zhilds: [
      createHTMLElement({
        src,
        style: {
          height: "1.75rem"
        },
        tag: "img"
      })
    ]
  });
  ret.onclick = () => {
    onclick();
    if (active()) {
      ret.classList.add("btn-success");
      ret.classList.remove("btn-secondary");
    } else {
      ret.classList.add("btn-secondary");
      ret.classList.remove("btn-success");
    }
    redraw("icon clicked");
  };
  return ret;
};

// src/client/containers/menu/crosshairToggle.ts
var crosshairToggle = iconButton({
  active: () => position.show.crosshair,
  onclick: () => position.show.crosshair = !position.show.crosshair,
  src: "bootstrap-icons-1.11.2/crosshair.svg"
});

// src/client/containers/menu/overlayToggle.ts
var overlayToggle = (source) => iconButton({
  active: () => Boolean(settings.tiles.enabled[source]),
  onclick: () => settings.tiles.enabled[source] = !settings.tiles.enabled[source],
  src: `icons/${source}.svg`
});

// src/client/containers/menu/navionicsToggle.ts
var navionicsToggle = overlayToggle("navionics");

// src/client/containers/menu/vfdensityToggle.ts
var vfdensityToggle = overlayToggle("vfdensity");

// src/client/containers/menuContainer.ts
var menuContainer = createHTMLElement({
  classes: ["d-flex", "d-flex-row", "gap-2", "m-2"],
  tag: "div",
  zhilds: [
    baselayerMenu,
    createHTMLElement({
      classes: ["btn-group"],
      role: "group",
      tag: "div",
      zhilds: [
        overlayToggle("openseamap"),
        vfdensityToggle,
        navionicsToggle,
        crosshairToggle,
        coordsToggle
      ]
    })
  ]
});

// src/client/getUserLocation.ts
var geolocationBlocked = false;
var updateGeoLocation = async () => {
  if (geolocationBlocked)
    return position.user;
  await new Promise((resolve, reject) => {
    return navigator.geolocation.getCurrentPosition(
      resolve,
      reject,
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5e3
      }
    );
  }).then((pos) => {
    const { accuracy, latitude, longitude } = pos.coords;
    position.user = {
      accuracy,
      latitude: latitude * Math.PI / 180,
      longitude: longitude * Math.PI / 180,
      timestamp: pos.timestamp
    };
  }).catch((err) => {
    if (err.code === 1)
      geolocationBlocked = true;
    console.warn(`ERROR(${err.code}): ${err.message}`);
  });
  updateInfoBox();
  return position.user;
};

// src/client/events/oninput.ts
var zoomIn = () => {
  if (position.z < 20) {
    position.z++;
    position.x *= 2;
    position.y *= 2;
    position.tiles = 1 << position.z;
    return true;
  }
  return false;
};
var zoomOut = () => {
  if (position.z > 2) {
    position.z--;
    position.x /= 2;
    position.y /= 2;
    position.tiles = 1 << position.z;
    return true;
  }
  return false;
};
var onchange = (event) => {
  if (!container)
    return;
  const { height, width } = container.getBoundingClientRect();
  const { type } = event;
  let needRedraw = false;
  if (event instanceof WheelEvent) {
    const { clientX, clientY, deltaY } = event;
    if (deltaY > 0) {
      needRedraw = zoomOut();
      position.x -= (clientX - width / 2) / tileSize / 2;
      position.y -= (clientY - height / 2) / tileSize / 2;
    } else if (deltaY < 0) {
      needRedraw = zoomIn();
      position.x += (clientX - width / 2) / tileSize;
      position.y += (clientY - height / 2) / tileSize;
    } else {
      console.log("noop", { deltaY, type });
      return;
    }
  } else if (event instanceof KeyboardEvent) {
    if (event.isComposing)
      return;
    const { key } = event;
    if (key >= "0" && key <= "9") {
      setBaseLayer(settings.tiles.baselayers[parseInt(key)]);
    } else if (key === "c")
      crosshairToggle.click();
    else if (key === "d")
      coordsToggle.click();
    else if (key === "l")
      updateGeoLocation();
    else if (key === "n")
      navionicsToggle.click();
    else if (key === "v")
      vfdensityToggle.click();
    else {
      needRedraw = true;
      if (key === "r") {
        position.x = Math.round(position.x);
        position.y = Math.round(position.y);
      } else if (key === "u") {
        position.x = lon2x(position.user.longitude);
        position.y = lat2y(position.user.latitude);
      } else if (key === "ArrowLeft")
        position.x--;
      else if (key === "ArrowRight")
        position.x++;
      else if (key === "ArrowUp")
        position.y--;
      else if (key === "ArrowDown")
        position.y++;
      else if (key === "PageDown")
        zoomIn();
      else if (key === "PageUp")
        zoomOut();
      else {
        needRedraw = false;
        console.log("noop", { key, type });
        return;
      }
    }
  } else if (event instanceof MouseEvent) {
    const { clientX, clientY } = event;
    position.x = Math.round(position.x * tileSize + (mouse.x - clientX)) / tileSize;
    position.y = Math.round(position.y * tileSize + (mouse.y - clientY)) / tileSize;
    needRedraw = true;
  }
  position.y = Math.max(0, Math.min(position.y, position.tiles));
  if (needRedraw)
    redraw(type);
};

// src/client/events/onmouse.ts
var onmouse = (event) => {
  console.log(event.type);
  const { clientX, clientY } = event;
  if (mouse.down) {
    if (mouse.x !== clientX || mouse.y !== clientY)
      onchange(event);
  }
  mouse.down = Boolean(event.buttons & 1);
  mouse.x = clientX;
  mouse.y = clientY;
  updateInfoBox();
};

// src/client/index.ts
var {
  container: containerId = ""
} = Object.fromEntries(new URL(import.meta.url).searchParams.entries());
var container = document.getElementById(containerId);
if (container) {
  container.innerHTML = "";
  container.append(mapContainer, overlayContainer, infoBox, menuContainer);
}
var tileSize = 256;
if (container) {
  window.addEventListener("keydown", onchange);
  window.addEventListener("wheel", onchange);
  window.addEventListener("mousemove", onmouse);
  window.addEventListener("resize", onchange);
  redraw("initial");
}
export {
  container,
  tileSize
};
//# sourceMappingURL=client.js.map
