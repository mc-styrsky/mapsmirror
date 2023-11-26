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

// src/client/containers/infoBox.ts
var infoBox = createHTMLElement({
  style: {
    backgroundColor: "#80808080",
    borderBottomRightRadius: "1em",
    left: "0px",
    padding: "0.3em",
    position: "absolute",
    top: "0px"
  },
  tag: "div",
  zhilds: []
});

// src/client/containers/mapContainer.ts
var mapContainer = createHTMLElement({
  style: {
    left: "0px",
    position: "absolute",
    top: "0px"
  },
  tag: "div",
  zhilds: []
});

// src/client/containers/overlayContainer.ts
var overlayContainer = createHTMLElement({
  style: {
    left: "0px",
    position: "absolute",
    top: "0px"
  },
  tag: "div",
  zhilds: []
});

// src/common/extractProperties.ts
function extractProperties(obj, builder) {
  return Object.entries(builder).reduce((ret, entry) => {
    const [key, constructor] = entry;
    ret[key] = constructor(obj[key]);
    return ret;
  }, {});
}

// src/client/globals/position.ts
var { source, ttl, x, y, z } = extractProperties(Object.fromEntries(new URL(window.location.href).searchParams.entries()), {
  source: (val) => String(val ?? "osm"),
  ttl: (val) => parseInt(val ?? 0),
  x: (val) => parseFloat(val ?? 2),
  y: (val) => parseFloat(val ?? 2),
  z: (val) => parseInt(val ?? 2)
});
var position = {
  map: { x, y, z },
  mouse: {
    down: false,
    x: 0,
    y: 0
  },
  show: { crosshairs: true },
  source,
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

// src/client/utils/px2nm.ts
var px2nm = (lat) => {
  const stretch = 1 / Math.cos(lat);
  return 360 * 60 / position.tiles / tileSize / stretch;
};

// src/client/globals/units.ts
var units = {
  coords: "minutes"
};

// src/client/utils/rad2deg.ts
var func = {
  decimal: ({ axis = " -", pad = 0, phi }) => {
    let deg = Math.round(phi * 180 / Math.PI % 360 * 1e5) / 1e5;
    while (deg > 180)
      deg -= 360;
    while (deg < -180)
      deg += 360;
    return `${axis[deg < 0 ? 1 : 0] ?? ""}${(deg < 0 ? -deg : deg).toFixed(5).padStart(pad + 6, "0")}\xB0`;
  },
  minutes: ({ axis = " -", pad = 0, phi }) => {
    let deg = Math.round(phi * 180 / Math.PI % 360 * 6e4) / 6e4;
    while (deg > 180)
      deg -= 360;
    while (deg < -180)
      deg += 360;
    const degrees = deg | 0;
    const minutes = (Math.abs(deg) - Math.abs(degrees)) * 60;
    return `${axis[deg < 0 ? 1 : 0] ?? ""}${(deg < 0 ? -degrees : degrees).toFixed(0).padStart(pad, "0")}\xB0 ${minutes.toFixed(3).padStart(6, "0")}'`;
  }
};
var rad2deg = ({ axis = " -", pad = 0, phi }) => func[units.coords]({ axis, pad, phi });

// src/client/utils/x2lon.ts
var x2lon = (x2, tiles = position.tiles) => (x2 / tiles - 0.5) * Math.PI * 2;

// src/client/utils/y2lat.ts
var y2lat = (y2, tiles = position.tiles) => Math.asin(Math.tanh((0.5 - y2 / tiles) * 2 * Math.PI));

// src/client/updateInfoBox.ts
var updateInfoBox = () => {
  if (!container)
    return;
  const { height, width } = container.getBoundingClientRect();
  const lat = y2lat(position.y);
  const lon = x2lon(position.x);
  const latMouse = y2lat(position.y + (position.mouse.y - height / 2) / tileSize);
  const lonMouse = x2lon(position.x + (position.mouse.x - width / 2) / tileSize);
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
    `User: ${rad2deg({ axis: "NS", pad: 2, phi: position.user.latitude })} ${rad2deg({ axis: "EW", pad: 3, phi: position.user.longitude })} (@${new Date(position.user.timestamp).toLocaleTimeString()})`
  );
};

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
  if (!position.show.crosshairs || !context)
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

// src/client/drawImage.ts
var drawImage = ({
  context,
  scale = 1,
  trans,
  ttl: ttl2,
  usedImages,
  x: x2,
  y: y2,
  z: z2
}) => {
  const src = `/tile/${position.source}/${[
    z2,
    Math.floor(x2 / scale).toString(16),
    Math.floor(y2 / scale).toString(16)
  ].join("/")}?ttl=${ttl2}`;
  const sx = Math.floor(frac(x2 / scale) * scale) * tileSize / scale;
  const sy = Math.floor(frac(y2 / scale) * scale) * tileSize / scale;
  const sw = tileSize / scale;
  const imageFromMap = imagesMap[src];
  if (imageFromMap) {
    usedImages.add(src);
    context.drawImage(
      imageFromMap,
      sx,
      sy,
      sw,
      sw,
      x2 * tileSize + trans.x,
      y2 * tileSize + trans.y,
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
        sx,
        sy,
        sw,
        sw,
        x2 * tileSize + trans.x,
        y2 * tileSize + trans.y,
        tileSize,
        tileSize
      );
      resolve(true);
    };
    img.onerror = () => {
      resolve(
        z2 > 0 ? drawImage({
          context,
          scale: scale << 1,
          trans,
          ttl: ttl2,
          usedImages,
          x: x2,
          y: y2,
          z: z2 - 1
        }) : false
      );
    };
  });
  return prom;
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
  const ttl2 = Math.max(Math.min(17, z2 + Math.max(1, position.ttl)) - z2, 0);
  await Promise.all(dxArray.map(async (dx) => {
    await Promise.all(dyArray.map((dy) => {
      return drawImage({ context, trans, ttl: ttl2, usedImages, x: dx, y: dy, z: z2 });
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
  context.beginPath();
  context.strokeStyle = "#808080";
  const latTop = Math.floor(y2lat(top) / scaleY) * scaleY;
  const latBottom = Math.ceil(y2lat(bottom) / scaleY) * scaleY;
  for (let ctr = 0; ctr < 1e3; ctr++) {
    const latGrid = latTop - scaleY * ctr;
    if (latGrid < latBottom)
      break;
    const gridY = lat2y(latGrid);
    context.strokeText(
      rad2deg({ axis: "NS", pad: 2, phi: latGrid }),
      (left - x2) * tileSize + 3,
      (gridY - y2) * tileSize - 3
    );
    context.moveTo((left - x2) * tileSize, (gridY - y2) * tileSize);
    context.lineTo((right - x2) * tileSize, (gridY - y2) * tileSize);
  }
  const lonLeft = Math.floor(x2lon(left) / scaleX) * scaleX;
  const lonRight = Math.ceil(x2lon(right) / scaleX) * scaleX;
  for (let ctr = 0; ctr < 1e3; ctr++) {
    const lonGrid = lonLeft + scaleX * ctr;
    if (lonGrid > lonRight)
      break;
    const gridX = lon2x(lonGrid);
    context.strokeText(
      rad2deg({ axis: "EW", pad: 3, phi: lonGrid }),
      (gridX - x2) * tileSize + 3,
      (bottom - y2) * tileSize - 3
    );
    context.moveTo((gridX - x2) * tileSize, (top - y2) * tileSize);
    context.lineTo((gridX - x2) * tileSize, (bottom - y2) * tileSize);
  }
  context.stroke();
  return canvas;
};

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
var redraw = async () => {
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
      redraw();
    }, 10);
    return;
  }
  working = true;
  newWorker = false;
  console.log("redraw");
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
  const newlocation = `${window.location.origin}${window.location.pathname}?${Object.entries({ source: position.source, ttl: position.ttl, x: position.x, y: y2, z: z2 }).map(([k, v]) => `${k}=${v}`).join("&")}`;
  window.history.pushState({ path: newlocation }, "", newlocation);
  setTimeout(() => working = false, 100);
};

// src/client/onchange.ts
var onchange = (event) => {
  if (!container)
    return;
  const { height, width } = container.getBoundingClientRect();
  const { type } = event;
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
  if (event instanceof WheelEvent) {
    const { clientX, clientY, deltaY } = event;
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
    else if (key === "PageDown")
      zoomIn();
    else if (key === "PageUp")
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
    else if (key === "7")
      position.source = "bingsat";
    else if (key === "8")
      position.source = "bluemarble";
    else if (key === "c")
      position.show.crosshairs = !position.show.crosshairs;
    else if (key === "d")
      units.coords = units.coords === "decimal" ? "minutes" : "decimal";
    else if (key === "l")
      updateGeoLocation();
    else if (key === "r") {
      position.x = Math.round(position.x);
      position.y = Math.round(position.y);
    } else if (key === "u") {
      position.x = lon2x(position.user.longitude);
      position.y = lat2y(position.user.latitude);
    } else {
      console.log("noop", { key, type });
      return;
    }
  } else if (event instanceof MouseEvent) {
    const { clientX, clientY } = event;
    position.x = Math.round(position.x * tileSize + (position.mouse.x - clientX)) / tileSize;
    position.y = Math.round(position.y * tileSize + (position.mouse.y - clientY)) / tileSize;
  }
  position.y = Math.max(0, Math.min(position.y, position.tiles));
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
if (container) {
  container.innerHTML = "";
  container.append(mapContainer, overlayContainer, infoBox);
}
var tileSize = 256;
if (container) {
  window.addEventListener("keydown", onchange);
  window.addEventListener("wheel", onchange);
  window.addEventListener("mousedown", onchange);
  window.addEventListener("mouseup", onchange);
  window.addEventListener("mousemove", onmousemove);
  window.addEventListener("resize", onchange);
  redraw();
}
export {
  container,
  tileSize
};
//# sourceMappingURL=client.js.map
