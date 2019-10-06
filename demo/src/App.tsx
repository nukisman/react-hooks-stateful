import React, { ChangeEvent, FC, ReactNode } from 'react';
import {
  useInput,
  Stateful,
  useWindowSize,
  useProp,
  useString,
  useSum,
  useProd,
  reuseProp,
  reusePropOf
} from 'react-dep-state';

/** Reusable Width of some type defined later */
const useWidth = reuseProp('width');

/** Reusable Width of number */
const useWidthOfNumber = reusePropOf('width')<number>();

const App: FC = () => {
  const name = useInput('Alex');
  const size = useWindowSize();
  const updateName = (e: ChangeEvent<HTMLInputElement>) =>
    name.set(e.target.value);
  const { width, height } = size;
  const width_ = size.state.width;
  const width__ = useWidth<number>(size);
  const width___: Stateful<number> = useWidth(size);
  const width____ = useWidthOfNumber(size);
  const width_____: Stateful<number> = useProp('width', size);
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
  /** No lambda generation. Single declaration of prop name and type */
  const semiPerimeter = useSum(width, height);
  const square = useProd(width, height);
  const str = useString`Hello ${name}! width = ${width}, num: ${size.width}`;
  return (
    <>
      <h4>Example: react-dep-state</h4>
      <input defaultValue={name.state} onChange={updateName} />
      <div>name: {name.state}</div>
      <br />
      <div>
        Window:
        <br />
        size: {width} x {height} px
        <br />
        width: {width} px
        <br />
        height: {height} px
        <br />
        Semi-perimeter: {semiPerimeter.state} px
        <br />
        Square: {square.state} px^2
        <br />
        widthSum: {widthSum.state}
      </div>
      <br />
      <div>Str: {str.state}</div>
    </>
  );
};

export default App;
