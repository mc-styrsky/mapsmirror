// src/common/extractProperties.ts
function extractProperties(obj, builder) {
  return Object.entries(builder).reduce((ret, entry) => {
    const [key, constructor] = entry;
    ret[key] = constructor(obj[key]);
    return ret;
  }, {});
}

// src/common/consts.ts
var port = 3e3;

// src/client/createHTMLElement.ts
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
var frac = (x) => x - Math.floor(x);

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
var x2lon = (x, tiles = position.tiles) => (x / tiles - 0.5) * Math.PI * 2;

// src/client/utils/y2lat.ts
var y2lat = (y, tiles = position.tiles) => Math.asin(Math.tanh((0.5 - y / tiles) * 2 * Math.PI));

// src/client/crosshairs.ts
var crosshairs = (canvas, context) => {
  const lat = y2lat(position.y);
  const lon = x2lon(position.x);
  const milesPerTile = 100 / nm2px(lat);
  const scale = Math.log10(milesPerTile);
  const scaleFloor = Math.floor(scale);
  const scaleFrac = frac(scale);
  const milesPerArc = Math.pow(10, scaleFloor) * (scaleFrac < 0.3 ? 1 : scaleFrac > 0.7 ? 5 : 2);
  const milesPerDiv = milesPerArc / 10;
  const center = {
    x: position.x * tileSize,
    y: position.y * tileSize
  };
  let minLast = 0;
  context.beginPath();
  context.strokeStyle = "#ff0000";
  context.moveTo(center.x - 5, center.y + 5);
  context.lineTo(center.x - 5, center.y - 5);
  context.lineTo(center.x, center.y - 10);
  context.lineTo(center.x + 5, center.y - 5);
  context.lineTo(center.x + 5, center.y + 5);
  context.lineTo(center.x - 5, center.y - 5);
  context.lineTo(center.x + 5, center.y - 5);
  context.lineTo(center.x - 5, center.y + 5);
  context.lineTo(center.x + 5, center.y + 5);
  context.stroke();
  for (let minArc = milesPerArc; minArc < milesPerArc * 100; minArc += milesPerArc) {
    if (minArc > 10800)
      break;
    const radiusX = nm2px(lat) * minArc;
    if (radiusX > canvas.width)
      break;
    const radDiv = min2rad(minArc);
    const circlePoints = sphericCircle(lat, lon, radDiv).map(([latPoint, lonPoint, draw]) => {
      const ret = [
        lon2x(lonPoint) * tileSize,
        lat2y(latPoint) * tileSize,
        draw
      ];
      return ret;
    });
    context.beginPath();
    context.strokeStyle = "#ff0000";
    circlePoints.forEach(([pointX, pointY, draw], idx) => {
      if (draw)
        context.lineTo(pointX, pointY);
      else
        context.moveTo(pointX, pointY);
      if (idx === 32)
        context.strokeText(`${minArc.toFixed(Math.max(0, -scaleFloor))}nm`, pointX, pointY);
    });
    context.stroke();
    const piHalf = Math.PI / 2;
    context.beginPath();
    for (let minDiv = minLast + milesPerDiv; minDiv < minArc; minDiv += milesPerDiv) {
      const radDiv2 = min2rad(minDiv);
      if (lat + radDiv2 < piHalf) {
        const top = lat2y(lat + radDiv2) * tileSize;
        context.moveTo(center.x - 5, top);
        context.lineTo(center.x + 5, top);
      }
      if (lat - radDiv2 > -piHalf) {
        const bottom = lat2y(lat - radDiv2) * tileSize;
        context.moveTo(center.x - 5, bottom);
        context.lineTo(center.x + 5, bottom);
      }
      const { cosOmega2, lat2, lon2 } = sphericLatLon({ lat, omega: piHalf, radius: radDiv2 });
      const sinOmega2 = Math.sqrt(1 - cosOmega2 * cosOmega2);
      context.moveTo(lon2x(lon + lon2) * tileSize + cosOmega2 * 5, lat2y(lat2) * tileSize - sinOmega2 * 5);
      context.lineTo(lon2x(lon + lon2) * tileSize - cosOmega2 * 5, lat2y(lat2) * tileSize + sinOmega2 * 5);
      context.moveTo(lon2x(lon - lon2) * tileSize - cosOmega2 * 5, lat2y(lat2) * tileSize - sinOmega2 * 5);
      context.lineTo(lon2x(lon - lon2) * tileSize + cosOmega2 * 5, lat2y(lat2) * tileSize + sinOmega2 * 5);
      context.strokeStyle = "#ff0000";
    }
    context.stroke();
    minLast = minArc;
  }
};

// src/client/createCanvas.ts
var imagesMap = {};
var createCanvas = async ({
  height,
  width,
  x,
  y,
  z
}) => {
  const canvas = createHTMLElement({
    style: {
      height: `${height}px`,
      width: `${width}px`
    },
    tag: "canvas"
  });
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context)
    return canvas;
  const translate = {
    x: Math.round(width / 2 - x * tileSize),
    y: Math.round(height / 2 - y * tileSize)
  };
  context.translate(
    translate.x,
    translate.y
  );
  const maxdx = Math.ceil((width - translate.x) / tileSize);
  const maxdy = Math.ceil((height - translate.y) / tileSize);
  const mindx = -Math.ceil(translate.x / tileSize);
  const mindy = -Math.ceil(translate.y / tileSize);
  const dxArray = [];
  for (let dx = mindx; dx < maxdx; dx++)
    dxArray.push(dx);
  const dyArray = [];
  for (let dy = mindy; dy < maxdy; dy++) {
    if (dy >= 0 && dy < position.tiles)
      dyArray.push(dy);
  }
  const usedImages = /* @__PURE__ */ new Set();
  await Promise.all(dxArray.map(async (dx) => {
    await Promise.all(dyArray.map((dy) => {
      const src = `http://localhost:${port}/tile/${position.source}/${[
        z,
        Math.floor(dx).toString(16),
        Math.floor(dy).toString(16)
      ].join("/")}?ttl=${position.ttl}`;
      const imageFromMap = imagesMap[src];
      if (imageFromMap) {
        usedImages.add(src);
        context.drawImage(
          imageFromMap,
          dx * tileSize,
          dy * tileSize,
          tileSize,
          tileSize
        );
        return Promise.resolve(true);
      }
      const img = new Image();
      img.src = src;
      const prom = new Promise((resolve) => {
        img.onload = () => {
          imagesMap[src] = img;
          usedImages.add(src);
          context.drawImage(
            img,
            dx * tileSize,
            dy * tileSize,
            tileSize,
            tileSize
          );
          resolve(true);
        };
        img.onerror = () => resolve(false);
      });
      return prom;
    }));
  })).then(() => {
    Object.keys(imagesMap).forEach((src) => {
      if (!usedImages.has(src))
        delete imagesMap[src];
    });
    crosshairs(canvas, context);
  });
  return canvas;
};

// src/client/rad2deg.ts
var rad2deg = (phi, pad = 0, axis = " -") => {
  const deg = phi * 180 / Math.PI;
  const degrees = deg | 0;
  const minutes = (Math.abs(deg) - Math.abs(degrees)) * 60;
  return `${axis[deg < 0 ? 1 : 0] ?? ""}${(deg < 0 ? -degrees : degrees).toFixed(0).padStart(pad, "0")}\xB0 ${minutes.toFixed(3).padStart(6, "0")}'`;
};

// src/client/utils/px2nm.ts
var px2nm = (lat) => {
  const stretch = 1 / Math.cos(lat);
  return 360 * 60 / position.tiles / tileSize / stretch;
};

// src/client/updateInfoBox.ts
var updateInfoBox = () => {
  if (!container)
    return;
  const { height, width } = container.getBoundingClientRect();
  const lat = y2lat(position.y);
  const lon = x2lon(position.x);
  const latMouse = y2lat(position.y + (position.mouse.y - height / 2) / tileSize);
  const lonMouse = x2lon(position.x + (position.mouse.x - width / 2) / tileSize);
  infoBox.innerHTML = "";
  infoBox.append(
    `TTL: ${position.ttl}`,
    createHTMLElement({ tag: "br" }),
    `Zoom: ${position.z} (${px2nm(lat).toPrecision(3)}nm/px)`,
    createHTMLElement({ tag: "br" }),
    `Lat/Lon: ${rad2deg(lat, 2, "NS")} ${rad2deg(lon, 3, "EW")}`,
    createHTMLElement({ tag: "br" }),
    `Mouse: ${rad2deg(latMouse, 2, "NS")} ${rad2deg(lonMouse, 3, "EW")}`
  );
};

// src/client/redraw.ts
var working = false;
var newWorker = false;
var infoBox = createHTMLElement({
  style: {
    backgroundColor: "#ffffff40",
    left: "0px",
    position: "absolute",
    top: "0px"
  },
  tag: "div",
  zhilds: []
});
var redraw = async () => {
  if (!container)
    return;
  if (working) {
    if (newWorker)
      return;
    newWorker = true;
    setTimeout(() => {
      newWorker = false;
      redraw();
    }, 10);
    return;
  }
  working = true;
  newWorker = false;
  console.log("redraw");
  const { height, width } = container.getBoundingClientRect();
  await createCanvas({
    height,
    width,
    ...position
  }).then((newCanvas) => {
    if (!container)
      return;
    container.innerHTML = "";
    container.append(newCanvas);
    updateInfoBox();
    container.append(infoBox);
  });
  const newlocation = `${window.location.origin}${window.location.pathname}?${Object.entries({
    source: position.source,
    ttl: position.ttl,
    x: position.x,
    y: position.y,
    z: position.z
  }).map(([k, v]) => `${k}=${v}`).join("&")}`;
  window.history.pushState({ path: newlocation }, "", newlocation);
  setTimeout(() => working = false, 100);
};

// src/client/onchange.ts
var onchange = (event) => {
  if (!container)
    return;
  const zoomIn = () => {
    if (position.z < 20) {
      position.z++;
      position.x *= 2;
      position.y *= 2;
      position.tiles = 1 << position.z;
    }
  };
  const zoomOut = () => {
    if (position.z > 2) {
      position.z--;
      position.x /= 2;
      position.y /= 2;
      position.tiles = 1 << position.z;
    }
  };
  const { type } = event;
  if (event instanceof WheelEvent) {
    const { clientX, clientY, deltaY } = event;
    const { height, width } = container.getBoundingClientRect();
    if (deltaY > 0) {
      zoomOut();
      position.x -= (clientX - width / 2) / tileSize / 2;
      position.y -= (clientY - height / 2) / tileSize / 2;
    } else if (deltaY < 0) {
      zoomIn();
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
    if (key === "ArrowLeft")
      position.x--;
    else if (key === "ArrowRight")
      position.x++;
    else if (key === "ArrowUp")
      position.y--;
    else if (key === "ArrowDown")
      position.y++;
    else if (key === "+")
      zoomIn();
    else if (key === "-")
      zoomOut();
    else if (key === "1")
      position.source = "osm";
    else if (key === "2")
      position.source = "googlesat";
    else if (key === "3")
      position.source = "navionics";
    else if (key === "4")
      position.source = "googlestreet";
    else if (key === "5")
      position.source = "googlehybrid";
    else if (key === "6")
      position.source = "gebco";
    else if (key === "PageUp")
      position.ttl++;
    else if (key === "PageDown") {
      position.ttl--;
      if (position.ttl < 0)
        position.ttl = 0;
    } else {
      console.log("noop", { key, type });
      return;
    }
  } else if (event instanceof MouseEvent) {
    const { clientX, clientY } = event;
    position.x += (position.mouse.x - clientX) / tileSize;
    position.y += (position.mouse.y - clientY) / tileSize;
  }
  const tileCount = 1 << position.z;
  position.y = Math.max(0, Math.min(position.y, tileCount - 1));
  if (position.x < 0)
    position.x += tileCount;
  if (position.x > tileCount)
    position.x -= tileCount;
  redraw();
};

// src/client/onmousemove.ts
var onmousemove = (event) => {
  if (event.buttons & 1)
    onchange(event);
  const { clientX, clientY } = event;
  position.mouse.x = clientX;
  position.mouse.y = clientY;
  updateInfoBox();
};

// src/client/index.ts
var {
  container: containerId = ""
} = Object.fromEntries(new URL(import.meta.url).searchParams.entries());
var container = document.getElementById(containerId);
var position = extractProperties(Object.fromEntries(new URL(window.location.href).searchParams.entries()), {
  mouse: () => ({
    down: false,
    x: 0,
    y: 0
  }),
  source: (val) => String(val ?? "osm"),
  tiles: () => 1,
  ttl: (val) => Number(val ?? 0),
  x: (val) => Number(val ?? 2),
  y: (val) => Number(val ?? 2),
  z: (val) => Number(val ?? 2)
});
position.tiles = 1 << position.z;
var tileSize = 256;
if (container) {
  window.addEventListener("keydown", onchange);
  window.addEventListener("wheel", onchange);
  window.addEventListener("mousedown", onchange);
  window.addEventListener("mouseup", onchange);
  window.addEventListener("mousemove", onmousemove);
  redraw();
}
export {
  container,
  position,
  tileSize
};
//# sourceMappingURL=client.js.map
