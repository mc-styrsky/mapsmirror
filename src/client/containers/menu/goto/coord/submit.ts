import { iconButton } from '../../iconButton';
import { coordForm } from './form';

export const coordSubmit = iconButton({
  onclick: () => coordForm.submit(),
  src: '/bootstrap-icons-1.11.2/arrow-right-circle.svg',
});
