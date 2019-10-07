import React, { ChangeEvent, FC } from 'react';
import {
  useInput,
  Stateful,
  useWindowSize,
  useProp,
  useString,
  useSum,
  useProd,
  reuseProp,
  reusePropOf,
  useInputArray,
  useMap,
  useConcat,
  useJoin,
  useSub,
  useDiv,
  Input,
  useAsync,
  useAsyncFun0,
  useAsyncFun1,
  useAsyncFun2
} from 'react-dep-state';

/** Reusable Width of some type defined later */
const useWidth = reuseProp('width');

/** Reusable Width of number */
const useWidthOfNumber = reusePropOf('width')<number>();
const asyncRandom = async () => 'Random: ' + Math.random();
const asyncInc = prev => async () => (prev.success || 0) + 1;
const asyncInc1 = prev => async a => (prev.success || 0) + a;
const asyncInc2 = prev => async (a, b) => (prev.success || 0) + a + b;

const App: FC = () => {
  const name = useInput('AlexZ');
  const size = useWindowSize();
  const updateName = (e: ChangeEvent<HTMLInputElement>) =>
    name.set(e.target.value);
  const { width, height } = size;
  const width_ = size.width;
  const width__ = useWidth<number>(size);
  const width___: Stateful<number> = useWidth(size);
  const width____ = useWidthOfNumber(size);
  const width_____: Stateful<number> = useProp('width', size);

  const readOnly: Stateful<number> = width__;
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
  const str = useString`Hello ${name}! width: ${width}, ${size.width}, ${size.state.width}`;
  const sizeKeys: string[] = [];
  for (const k in size) sizeKeys.push(k);
  const array = useInputArray([width, width_____, height]);
  const concatArray = useConcat(array, width, [width, height], width);
  const mapArray = useMap(concatArray, n => n * 2);
  const joinArray = useJoin(mapArray, '; ');

  const sum = useSum(width_____, height, width_____, width, 33);
  const sub = useSub(width_____, height, width_____, width, 33);
  const prod = useProd(width_____, height, width_____, width, 33);
  const div = useDiv(width_____, height, width_____, width, 33);
  const async = useAsync<string>();
  const asyncFun0 = useAsyncFun0(asyncInc, { runOnInit: true });
  const asyncFun1 = useAsyncFun1(asyncInc1, { runOnInit: [0] });
  const asyncFun2 = useAsyncFun2(asyncInc2, { runOnInit: [0, 0] });
  return (
    <>
      <h4>Example: react-dep-state</h4>
      ReadOnly: {readOnly.state}
      <br />
      <button onClick={writeReadOnly}>Write ReadOnly Stateful !</button>
      <hr />
      <input defaultValue={name.state} onChange={updateName} />
      <div>name.state: {name.state}</div>
      <br />
      <div>
        Window:
        <br />
        size: {width} x {height} px
        <br />
        Semi-perimeter: {semiPerimeter.state} px
        <br />
        Square: {square.state} px^2
        <br />
        widthSum: {widthSum.state}
        <br />
        sizeKeys: [{sizeKeys.join(', ')}]
        <br />
        size.state keys: [{Object.keys(size.state).join(', ')}]
        <br />
        size keys: [{Object.keys(size).join(', ')}]
        <br />
        size OwnPropertyNames: [{Object.getOwnPropertyNames(size).join(', ')}]
        <br />
        size OwnPropertySymbols: [
        {Object.getOwnPropertySymbols(size).join(', ')}]
      </div>
      <hr />
      <div>Str template: {str.state}</div>
      <hr />
      Sum: {sum.state}
      <br />
      Sub: {sub.state}
      <br />
      Prod: {prod.state}
      <br />
      Div: {div.state}
      <hr />
      <div>Array: {array.state.join(', ')}</div>
      <button onClick={() => array.map(n => n + 1)}>Map: n =&gt; n + 1</button>
      <br />
      Filter: n &gt;&nbsp;
      <input
        type="number"
        defaultValue={200}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          array.filter(n => n > e.target.valueAsNumber);
        }}
      />
      <hr />
      Dependent arrays:
      <br />
      Concat: [{concatArray.join(', ')}]
      <br />
      Map: [{mapArray.join(', ')}]
      <br />
      Join: ({joinArray.state})
      <hr />
      <button onClick={() => async.await(asyncRandom())}>
        Await
      </button> Async: {async.state.success}
      <br />
      <button onClick={() => asyncFun0.call()}>Call 0</button> AsyncFun:{' '}
      {asyncFun0.state.success}
      <br />
      <button onClick={() => asyncFun1.call(width_____.state)}>
        Call 1
      </button>{' '}
      AsyncFun: {asyncFun1.state.success}
      <br />
      <button onClick={() => asyncFun2.call(size.height, width_____.state)}>
        Call 2
      </button>{' '}
      AsyncFun: {asyncFun2.state.success}
    </>
  );
};

export default App;
