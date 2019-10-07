import React, { FC } from 'react';
import Demo from './Demo';
import {
  Pure,
  useWindowSize,
  reuseProp,
  useSum,
  reusePropOf,
  useProp
} from 'react-hooks-pure';

/** Reusable Width of some type defined later */
const useWidth = reuseProp('width');

/** Reusable Width of number */
const useWidthOfNumber = reusePropOf('width')<number>();

const DemoObjectProps: FC = () => {
  const size = useWindowSize();
  const { width, height } = size;
  const width_ = size.width;
  const width__ = useWidth<number>(size);
  const width___: Pure<number> = useWidth(size);
  const width____ = useWidthOfNumber(size);
  const width_____: Pure<number> = useProp('width', size);
  const sizeKeys: string[] = [];
  for (const k in size) sizeKeys.push(k);

  /** For type checking */
  const widthSum = useSum(
    size.width,
    width,
    width_,
    width__,
    width___,
    width____,
    width_____
  );
  return (
    <Demo title="Object Props">
      Sum of widths (values and Pure state holder transparently):{' '}
      {widthSum.state}
      <br />
      sizeKeys: [{sizeKeys.join(', ')}]
      <br />
      size.state keys: [{Object.keys(size.state).join(', ')}]
      <br />
      size keys: [{Object.keys(size).join(', ')}]
      <br />
      size OwnPropertyNames: [{Object.getOwnPropertyNames(size).join(', ')}]
      <br />
      size OwnPropertySymbols: [{Object.getOwnPropertySymbols(size).join(', ')}]
    </Demo>
  );
};

export default DemoObjectProps;
