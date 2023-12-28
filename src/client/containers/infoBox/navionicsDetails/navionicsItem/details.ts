import type { NavionicsItemSpinner } from './spinner';
import { castObject } from '../../../../../common/extractProperties';
import { Container } from '../../../../utils/htmlElements/container';

export class NavionicsItemDetails extends Container {
  constructor (itemId: string, spinner: NavionicsItemSpinner) {
    super(Container.from('div', {
    }));

    this.append('fetching...');

    fetch(`/navionics/objectinfo/${itemId}`)
    .then(async (res) => res.ok ? await res.json() : {})
    .catch(() => ({}))
    .then(body => {
      const { properties } = castObject(body,
        {
          properties: (val) => Array.isArray(val) ?
            val.map(({ label }) => String(label)) :
            [],
        },
      );
      this.clear();
      if (properties) properties.forEach(prop => {
        if (prop) this.append(Container.from('p').append(prop));
      });
      spinner.html.parentNode?.removeChild(spinner.html);
    });
  }
}
