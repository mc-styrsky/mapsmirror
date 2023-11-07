// src/common/extractProperties.ts
function extractProperties(obj, builder) {
  return Object.entries(builder).reduce((ret, entry) => {
    const [key, constructor] = entry;
    ret[key] = constructor(obj[key]);
    return ret;
  }, {});
}

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

// src/client/index.ts
var {
  container: containerId = ""
} = Object.fromEntries(new URL(import.meta.url).searchParams.entries());
var container = document.getElementById(containerId);
console.log(Object.fromEntries(new URL(window.location.href).searchParams.entries()));
var position = extractProperties(Object.fromEntries(new URL(window.location.href).searchParams.entries()), {
  source: (val) => String(val ?? "osm"),
  x: (val) => Number(val ?? 2),
  y: (val) => Number(val ?? 2),
  z: (val) => Number(val ?? 2)
});
var tileSize = 256;
var createImages = ({
  centerX,
  centerY,
  countX,
  countY,
  x,
  y,
  z
}) => {
  const images = [];
  for (let dy = 0 - countY; dy <= countY; dy++) {
    if (y + dy < 0)
      continue;
    if (y + dy >= 1 << z)
      continue;
    for (let dx = 0 - countX; dx <= countX; dx++) {
      const image = createHTMLElement({
        src: `http://localhost:3000/tile/${position.source}/${[
          z,
          Math.floor(x + dx).toString(16),
          Math.floor(y + dy).toString(16)
        ].join("/")}?ttl=1`,
        style: {
          left: `${centerX + (dx - x + Math.floor(x)) * tileSize}px`,
          position: "absolute",
          top: `${centerY + (dy - y + Math.floor(y)) * tileSize}px`
        },
        tag: "img"
      });
      images.push(image);
    }
  }
  return images;
};
if (container) {
  const redraw = () => {
    console.log("redraw");
    const { height, width } = container.getBoundingClientRect();
    const viewport = {
      centerX: Math.round(width / 2),
      centerY: Math.round(height / 2)
    };
    const countX = Math.ceil(viewport.centerX / tileSize);
    const countY = Math.ceil(viewport.centerY / tileSize);
    container.innerHTML = "";
    container.append(...createImages({
      centerX: viewport.centerX,
      centerY: viewport.centerY,
      countX,
      countY,
      x: position.x,
      y: position.y,
      z: position.z
    }));
    container.append(createHTMLElement({
      style: {
        left: "0px",
        position: "absolute",
        textShadow: "0 0 5px white",
        top: "0px"
      },
      tag: "div",
      zhilds: [
        `Zoom: ${position.z}`,
        createHTMLElement({ tag: "br" }),
        "Lat: X",
        createHTMLElement({ tag: "br" }),
        "Lon: X"
      ]
    }));
  };
  window.onwheel = (event) => {
    event;
  };
  const onchange = (event) => {
    const zoomIn = () => {
      if (position.z < 20) {
        position.z++;
        position.x *= 2;
        position.y *= 2;
      }
    };
    const zoomOut = () => {
      if (position.z > 2) {
        position.z--;
        position.x /= 2;
        position.y /= 2;
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
      else {
        console.log("noop", { key, type });
        return;
      }
    }
    position.y = Math.max(0, Math.min(position.y, (1 << position.z) - 1));
    const newlocation = `${window.location.origin}${window.location.pathname}?${Object.entries(position).map(([k, v]) => `${k}=${v}`).join("&")}`;
    window.history.pushState({ path: newlocation }, "", newlocation);
    redraw();
  };
  window.addEventListener("keydown", onchange);
  window.addEventListener("wheel", onchange);
  window.addEventListener("mousedown", onchange);
  redraw();
}
//# sourceMappingURL=client.js.map
