import { Container } from '../../container';
import { updateSavedPositionsList } from './savedPositions/updateSavedPositionsList';

export const savedPositions = Container.from('div');

updateSavedPositionsList();
