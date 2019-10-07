import React, { FC } from 'react';
import Demo from './Demo';
import { Pure, Input, useDep } from 'react-hooks-pure';
import { useMouseCoord } from './DemoMouse';

const TestWriteReadOnly: FC = () => {
  const coord = useMouseCoord();
  const readOnly: Pure<number> = useDep(coord, coord => coord.x);
  const writeReadOnly = () => {
    let writeReadOnly = false;
    try {
      (readOnly as Input<number>).set(0);
      writeReadOnly = true;
    } catch (e) {
      console.log(e);
      writeReadOnly = false;
    }
    if (writeReadOnly) throw new Error('Write ReadOnly value');
  };
  return (
    <Demo title="Test Write ReadOnly">
      ReadOnly: {readOnly.state}
      <br />
      <button onClick={writeReadOnly}>Write ReadOnly Stateful !</button>
      <br />
      Expected error message in console output
    </Demo>
  );
};

export default TestWriteReadOnly;
