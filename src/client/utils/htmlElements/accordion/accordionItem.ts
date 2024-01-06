import type { Appendable } from '../../../globals/appendable';
import { Container } from '../container';
import { AccordionBody } from './accordionBody';
import { AccordionHead } from './accordionHead';

export class AccordionItem extends Container {
  constructor ({ bodyLabel, headLabel, itemId: itemIdRaw, show }: {
    bodyLabel?: Appendable;
    headLabel: Appendable;
    show?: boolean;
    itemId: string
  }) {
    super('div', {
      classes: [
        'accordion-item',
        'AccordionLabel',
      ],
    });
    const itemId = `item_${itemIdRaw.replace(/=*$/, '')}`;
    const isBody = Boolean(bodyLabel);
    this.head = new AccordionHead({ body: isBody, itemId, label: headLabel });
    this.append(this.head);
    if (bodyLabel) {
      this.body = new AccordionBody({ body: bodyLabel, itemId });
      this.append(this.body);
      if (show) this.show();
      else this.hide();
    }
  }

  body: AccordionBody | null = null;
  head: AccordionHead;

  show () {
    if (this.body) {
      this.head.show();
      this.body.show();
    }
  }
  hide () {
    if (this.body) {
      this.head.hide();
      this.body.hide();
    }
  }
  set headLabel (label: Appendable) {
    this.head.label = label;
  }
}
