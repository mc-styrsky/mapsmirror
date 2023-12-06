import { details } from '../globals/details';
import { position } from '../globals/position';
import { updateInfoBox } from '../updateInfoBox';
import { x2lon } from '../utils/x2lon';
import { y2lat } from '../utils/y2lat';

export const onclick = (event: MouseEvent) => {
  console.log(event.target);
  details.clear();
  updateInfoBox();
  fetch(`https://webapp.navionics.com/api/v2/quickinfo/marine/${y2lat(position.y) * 180 / Math.PI}/${x2lon(position.x) * 180 / Math.PI}?su=kmph&du=kilometers&dpu=meters&ugc=true&scl=false&z=11&sd=20&lang=de&_=1701878860273`).then(
    async res => {
      if (!res.ok) return;
      const list = await Promise.all((await res.json()).items.forEach(async item => {
        console.log(item);
        const hasDetails = item.details;
        item.details = null;
        details.add(item);
        updateInfoBox();
        if (hasDetails) {
          const itemDetails = await fetch(`https://webapp.navionics.com/api/v2/objectinfo/marine/${item.id}?su=kmph&du=kilometers&dpu=meters&ugc=true&scl=false&z=11&sd=20&lang=de&_=1701878860274`)
          .then(
            async res => res.ok ? (await res.json()).properties : null,
            () => null,
          );
          item.details = itemDetails;
          console.log(itemDetails);
          details.add(item);
          updateInfoBox();
        }
      }));
      console.log(list);
    },
    rej => console.error(rej),
  );
};
