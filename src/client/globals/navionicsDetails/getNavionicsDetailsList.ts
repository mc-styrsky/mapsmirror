import type { XYZ } from '../../../common/types/xyz';
import type { NavionicsDetails } from '../navionicsDetails';
import { extractProperties } from '../../../common/extractProperties';
import { infoBox } from '../../containers/infoBox';
import { deg2rad } from '../../utils/deg2rad';
import { lat2y } from '../../utils/lat2y';
import { lon2x } from '../../utils/lon2x';
import { px2nm } from '../../utils/px2nm';
import { settings } from '../settings';
import { tileSize } from '../tileSize';

const abortControllers: Set<AbortController> = new Set();

export async function getNavionicsDetailsList (
  { parent, x, y, z }: XYZ & { parent: NavionicsDetails },
) {
  while (parent.queue.shift()) (() => void 0)();
  abortControllers.forEach(ac => ac.abort());
  if (!settings.show.navionicsDetails) return;
  const listMap: Map<string, any> = new Map();
  await parent.queue.enqueue(async () => {
    parent.isFetch = true;
    parent.clear2();
    const abortController = new AbortController();
    abortControllers.add(abortController);
    const { signal } = abortController;
    const max = 4;
    const perTile = 20;
    const points: { dx: number; dy: number; radius: number; }[] = [{
      dx: Math.round(x * tileSize) / tileSize,
      dy: Math.round(y * tileSize) / tileSize,
      radius: 0,
    }];
    for (let iX = -max; iX < max; iX++) {
      for (let iY = -max; iY < max; iY++) {
        const dx = Math.ceil(x * perTile + iX) / perTile;
        const dy = Math.ceil(y * perTile + iY) / perTile;
        const radius = Math.sqrt((dx - x) * (dx - x) + (dy - y) * (dy - y));
        points.push({ dx, dy, radius });
      }
    }
    let done = 0;
    await points
    .sort((a, b) => a.radius - b.radius)
    .reduce(async (prom, { dx, dy }) => {
      const ret = fetch(`/navionics/quickinfo/${z}/${dx}/${dy}`, { signal })
      .then(async (res) => {
        if (!res.ok) return;
        const body = await res.json();
        await Promise.all((body.items ?? []).map(async (item: Record<string, any>) => {
          if (listMap.has(item.id)) return;
          if ([
            'depth_area',
            'depth_contour',
          ].includes(item.category_id)) return;
          listMap.set(item.id, item);
          const {
            category_id, details, icon_id, id, name, position,
          } = extractProperties(item, {
            category_id: String,
            details: Boolean,
            icon_id: String,
            id: String,
            name: String,
            position: ({ lat, lon }) => ({
              lat: deg2rad(lat),
              lon: deg2rad(lon),
              x: lon2x(deg2rad(lon)),
              y: lat2y(deg2rad(lat)),
            }),
          });
          const pdx = position.x - x;
          const pdy = position.y - y;
          const distance = Math.sqrt(pdx * pdx + pdy * pdy) * tileSize * px2nm(position.lat);
          parent.add({
            category_id,
            details,
            distance,
            icon_id,
            id,
            name,
            position,
          });
          if (item.details) {
            const { label, properties } = extractProperties(
              await fetch(`/navionics/objectinfo/${item.id}`, { signal })
              .then(async (res) => res.ok ? await res.json() : {})
              .catch(() => { }),
              {
                label: String,
                properties: (val) => val?.map(({ label }) => label)?.filter(Boolean),
              },
            );
            parent.add({
              category_id,
              details,
              distance,
              icon_id,
              id,
              label,
              name,
              position,
              properties,
            });
          }
        }));
      })
      .catch(rej => console.error(rej));
      await ret;
      done++;
      parent.fetchProgress = `${done}/${points.length}`;
      parent.clearHtmlList();
      infoBox.update();
      return prom;
    }, Promise.resolve());
    abortControllers.delete(abortController);
    parent.isFetch = false;
  });
  parent.clearHtmlList();
}
