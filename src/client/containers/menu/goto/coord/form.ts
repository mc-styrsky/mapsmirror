import Coordinates from 'coordinate-parser';
import { coordUnits } from '../../../../globals/coordUnits';
import { position } from '../../../../globals/position';
import { deg2rad } from '../../../../utils/deg2rad';
import { Container } from '../../../../utils/htmlElements/container';
import { IconButton } from '../../../../utils/htmlElements/iconButton';
import { MonoContainer } from '../../../../utils/htmlElements/monoContainer';
import { lat2y } from '../../../../utils/lat2y';
import { lon2x } from '../../../../utils/lon2x';
import { rad2stringFuncs } from '../../../../utils/rad2string';

export class CoordForm extends MonoContainer<'form'> {
  private static valid = false;
  private static lat = NaN;
  private static lon = NaN;
  static readonly html: HTMLFormElement;

  private static readonly submit = new IconButton({
    icon: 'arrow-right-circle',
    onclick: () => this.html.submit(),
  });
  private static readonly error = new Container('div', { classes: ['form-text'] });
  private static readonly info = {
    d: new Container('div', { classes: ['form-text', 'w-100'] }),
    dm: new Container('div', { classes: ['form-text', 'w-100'] }),
    dms: new Container('div', { classes: ['form-text', 'w-100'] }),
  };
  private static readonly input = new Container('input', {
    autocomplete: 'off',
    classes: ['form-control'],
    oninput: () => {
      console.log('oninput');
      this.refresh();
    },
    placeholder: 'Coordinates',
    type: 'text',
  });

  static refresh () {
    coordUnits.forEach(u => {
      this.info[u].style = { display: 'none' };
    });

    const { value } = this.input.html;

    if (!value) this.submit.html.classList.add('disabled');
    try {
      const coords = new Coordinates(value);
      this.lat = deg2rad(coords.getLatitude());
      this.lon = deg2rad(coords.getLongitude());
      coordUnits.forEach(u => {
        console.log('update lat/lon');
        const func = rad2stringFuncs[u];
        this.info[u].html.innerText = `${func({ axis: 'NS', pad: 2, phi: this.lat })} ${func({ axis: 'EW', pad: 3, phi: this.lon })}`;
        this.info[u].style = { display: 'block' };
        this.submit.html.classList.remove('disabled');
      });
      this.error.style = { display: 'none' };
      this.valid = true;
    }
    catch (e) {
      this.valid = false;
      this.error.html.innerText = e instanceof Error ? e.toString() : 'unknown error';
      this.error.style = { display: 'block' };
      this.submit.html.classList.add('disabled');
    }
  }

  static {
    this.copyInstance(new Container('form', {
      action: 'javascript:void(0)',
      classes: ['GotoForm'],
      onsubmit: () => {
        if (this.valid) position.xyz = {
          x: lon2x(this.lon),
          y: lat2y(this.lat),
        };
        return this.valid;
      },
    }), this);

    this.append(
      new Container('div', {
        classes: ['input-group'],
      })
      .append(
        this.input,
        this.submit,
      ),
      this.error,
      this.info.d,
      this.info.dm,
      this.info.dms,
    );
  }
}
