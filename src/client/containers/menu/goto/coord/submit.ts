import { IconButton } from '../../../../utils/htmlElements/iconButton';
import { coordForm } from './form';

export const coordSubmit = new IconButton({
  icon: 'arrow-right-circle',
  onclick: () => coordForm.html.submit(),
});
