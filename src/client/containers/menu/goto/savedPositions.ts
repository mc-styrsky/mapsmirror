import { createHTMLElement } from '../../../utils/createHTMLElement';
import { updateSavedPositionsList } from './savedPositions/updateSavedPositionsList';

export const savedPositions = createHTMLElement({
  tag: 'div',
});

updateSavedPositionsList();
