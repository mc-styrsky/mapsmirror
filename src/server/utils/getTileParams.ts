export const getTileParams = ({ x, y, z }: { x: number; y: number; z: number; }) => {
  const length = z + 3 >> 2;
  const pathX = x.toString(16).padStart(length, '0').split('');
  const pathY = y.toString(16).padStart(length, '0').split('');


  const tileFileId = `${pathX.pop()}${pathY.pop()}`;
  const tilePath = pathX.map((_val, idx) => pathX[idx] + pathY[idx]).join('/');
  const tileId = `${tilePath}/${tileFileId}`;
  return {
    tileFileId,
    tileId,
    tilePath,
    z,
  };
};
