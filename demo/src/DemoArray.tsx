import React, { FC } from 'react';
import Demo from './Demo';
import {
  useConcat,
  useMap,
  useJoin,
  useDep2,
  useFilter
} from 'react-hooks-pure';
import { useMouseCoord } from './DemoMouse';

/** Move lambdas here to prevent re-render loop */
const map = n => n * 2;
const filter = n => n > 100;

const DemoArray: FC = () => {
  const { x, y } = useMouseCoord().state;
  const array = useDep2(x, y, (x, y) => [x, y, x * 2, y + 3]);
  const joinArray = useJoin(array, ', ');
  const concatArray = useConcat(array, x, [x, y], x);
  const mapArray = useMap(concatArray, map);
  const filterArray = useFilter(array, filter);
  return (
    <Demo title="Array">
      Join: ({joinArray.state})
      <br />
      Concat: [{concatArray.join(', ')}]
      <br />
      Map: [{mapArray.join(', ')}]
      <br />
      Filter: [{filterArray.join(', ')}]
    </Demo>
  );
};

export default DemoArray;
