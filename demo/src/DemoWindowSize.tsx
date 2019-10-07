import React, { FC } from 'react';
import Demo from './Demo';
import { useWindowSize } from 'react-hooks-pure';

const DemoWindowSize: FC = () => {
  const size = useWindowSize();
  const { width, height } = size;
  return (
    <Demo title="Window Size">
      Window:
      <br />
      size: {width} x {height} px
    </Demo>
  );
};

export default DemoWindowSize;
