import React, { FC } from 'react';
import Demo from './Demo';
import { useString, useStringConcat, useSum, Pure } from 'react-hooks-pure';
import { useMouseCoord } from './DemoMouse';

const DemoString: FC = () => {
  const { x, y } = useMouseCoord().state;
  const sum: Pure<number> = useSum(x, y);
  const strConcat = useStringConcat(x, ' + ', y, ' = ', sum);
  const str = useString`${x} + ${y} = ${sum}`;
  return (
    <Demo title="String">
      String concat: {strConcat.state}
      <br />
      Tagged template string: {str.state}
    </Demo>
  );
};

export default DemoString;
