import type { XYZ } from '../../../common/types/xyz';
import type { NavionicsDetails } from '../navionicsDetails';
import { extractProperties } from '../../../common/extractProperties';
import { lat2y } from '../../utils/lat2y';
import { lon2x } from '../../utils/lon2x';
import { settings } from '../settings';

export const getNavionicsDetailsList = async ({ parent, x, y, z }: XYZ & {
  parent: NavionicsDetails;
}) => {
  if (!settings.navionicsDetails.show) return;
  while (parent.queue.shift()) (() => void 0)();
  const listMap: Map<string, any> = new Map();
  await parent.queue.enqueue(async () => {
    parent.isFetch = true;
    parent.clear();
    const max = 4;
    const perTile = 20;
    const points: { dx: number; dy: number; radius: number; }[] = [];
    for (let iX = - max; iX <= max; iX++) {
      for (let iY = - max; iY < max; iY++) {
        const dx = Math.round(x * perTile + iX) / perTile;
        const dy = Math.round(y * perTile + iY) / perTile;
        const radius = Math.sqrt(iX * iX + iY * iY);
        points.push({ dx, dy, radius });
      }
    }
    await points
    .sort((a, b) => a.radius - b.radius)
    .reduce(async (prom, { dx, dy, radius }) => {
      await prom;
      console.log({ radius });
      const ret = fetch(`/navionics/quickinfo/${z}/${dx}/${dy}`)
      .then(
        async (res) => {
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
                lat: Number(lat),
                lon: Number(lon),
                x: lon2x(Number(lon) * Math.PI / 180),
                y: lat2y(Number(lat) * Math.PI / 180),
              }),
            });
            const pdx = position.x - x;
            const pdy = position.y - y;
            const distance = Math.sqrt(pdx * pdx + pdy * pdy);
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
                await fetch(`/navionics/objectinfo/${item.id}`)
                .then(
                  async (res) => res.ok ? await res.json() : {},
                  () => { },
                ),
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
        },
        rej => console.error(rej),

      );
      await prom;
      return ret;
    }, Promise.resolve());
    parent.isFetch = false;
  });
  parent.clearHtmlList();
};
