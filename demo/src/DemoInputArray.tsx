import React, { ChangeEvent, FC } from 'react';
import Demo from './Demo';
import { useInputArray } from 'react-hooks-pure';
import { useMouseCoord } from './DemoMouse';

const DemoInputArray: FC = () => {
  const { x, y } = useMouseCoord().state;
  const values = [x, y, x * 2, y + 3];
  const array = useInputArray(values);
  return (
    <Demo title="InputArray">
      <div>Array: {array.state.join(', ')}</div>
      <button onClick={() => array.set(values)}>Restore in place</button>
      <br />
      <button onClick={() => array.map(n => n + 1)}>
        Map in place: n =&gt; n + 1
      </button>
      <br />
      Filter in place: n &gt;&nbsp;
      <input
        type="number"
        defaultValue={200}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          array.filter(n => n > e.target.valueAsNumber);
        }}
      />
    </Demo>
  );
};

export default DemoInputArray;
