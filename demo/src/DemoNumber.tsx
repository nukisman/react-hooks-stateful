import React, { FC } from 'react';
import Demo from './Demo';
import { useSum, useSub, useProd, useDiv } from 'react-hooks-pure';
import { useMouseCoord } from './DemoMouse';

const DemoNumber: FC = () => {
  const { x, y } = useMouseCoord().state;
  const sum = useSum(x, y, x * 2, y - 3, 33);
  const sub = useSub(sum, x, y, sum.state / 2, 33);
  const prod = useProd(sum, sub, x, y, 33);
  const div = useDiv(sum, prod, sub, x, 33);
  return (
    <Demo title="Number">
      Sum: {sum.state}
      <br />
      Sub: {sub.state}
      <br />
      Prod: {prod.state}
      <br />
      Div: {div.state}
    </Demo>
  );
};

export default DemoNumber;
