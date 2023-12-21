import { iconButton } from '../../iconButton';
import { coordForm } from './form';

export const coordSubmit = iconButton({
  icon: 'arrow-right-circle',
  onclick: () => coordForm.html.submit(),
});
