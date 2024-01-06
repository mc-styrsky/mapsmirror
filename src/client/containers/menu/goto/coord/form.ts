import Coordinates from 'coordinate-parser';
import { coordUnits } from '../../../../globals/coordUnits';
import { position } from '../../../../globals/position';
import { deg2rad } from '../../../../utils/deg2rad';
import { Container } from '../../../../utils/htmlElements/container';
import { IconButton } from '../../../../utils/htmlElements/iconButton';
import { lat2y } from '../../../../utils/lat2y';
import { lon2x } from '../../../../utils/lon2x';
import { rad2stringFuncs } from '../../../../utils/rad2string';

class CoordForm extends Container<'form'> {
  constructor () {
    super('form', {
      action: 'javascript:void(0)',
      classes: ['GotoForm'],
      onsubmit: () => {
        if (this.valid) position.xyz = {
          x: lon2x(this.lon),
          y: lat2y(this.lat),
        };
        return this.valid;
      },
    });

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
  private valid = false;
  private lat = NaN;
  private lon = NaN;

  private readonly submit = new IconButton({
    icon: 'arrow-right-circle',
    onclick: () => this.html.submit(),
  });
  private readonly error = new Container('div', { classes: ['form-text'] });
  private readonly info = {
    d: new Container('div', { classes: ['form-text', 'w-100'] }),
    dm: new Container('div', { classes: ['form-text', 'w-100'] }),
    dms: new Container('div', { classes: ['form-text', 'w-100'] }),
  };
  private readonly input = new Container('input', {
    autocomplete: 'off',
    classes: ['form-control'],
    oninput: () => {
      console.log('oninput');
      this.refresh();
    },
    placeholder: 'Coordinates',
    type: 'text',
  });

  refresh () {
    coordUnits.forEach(u => {
      this.info[u].html.style.display = 'none';
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
        this.info[u].html.style.display = 'block';
        this.submit.html.classList.remove('disabled');
      });
      this.error.html.style.display = 'none';
      this.valid = true;
    }
    catch (e) {
      this.valid = false;
      this.error.html.innerText = e instanceof Error ? e.toString() : 'unknown error';
      this.error.html.style.display = 'block';
      this.submit.html.classList.add('disabled');
    }
  }
}

export const coordForm = new CoordForm();
