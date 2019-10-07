import React, { FC } from 'react';
import {
  Pure,
  useAsyncInput,
  useAsyncFun0,
  useAsyncFun1,
  useAsyncFun2,
  AsyncState,
  useSuccess,
  useFailure,
  useAsyncDep,
  useAsyncDep2
} from 'react-hooks-pure';
import Demo from './Demo';
import { useMouseCoord } from './DemoMouse';

const asyncRandom = async () => Math.random();
const asyncInc0 = prev => async () => {
  await delay(500);
  return (prev.success || 0) + 1;
};
const asyncInc1 = prev => async a => {
  await delay(500);
  return (prev.success || 0) + a;
};
const asyncInc2 = prev => async (a, b) => {
  await delay(500);
  return (prev.success || 0) + a + b;
};
const asyncUnstable = prev => async n => {
  await delay(500);
  if (Math.random() > 0.5) {
    return 'OK at ' + new Date().getTime();
  } else {
    throw new Error('Fail at ' + new Date().getTime());
  }
};
export const delay = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms));

const DemoAsync: FC = () => {
  const { x, y } = useMouseCoord().state;
  const asyncInput = useAsyncInput<number>();
  const asyncFun0 = useAsyncFun0(asyncInc0, { runOnInit: true });
  const asyncFun1 = useAsyncFun1(asyncInc1, { runOnInit: [0] });
  const asyncFun2 = useAsyncFun2(asyncInc2, { runOnInit: [0, 0] });
  const asyncFunUnstable = useAsyncFun1(asyncUnstable);
  const lastSuccess = useSuccess(asyncFunUnstable, 'Default Success');
  const lastFailure = useFailure(
    asyncFunUnstable,
    new Error('Default Failure')
  );
  const asyncDep = useAsyncDep<string, string>(
    `async x: ${x}`,
    prev => async (coordX: string) => coordX + ' !!!'
  );
  const asyncDep2 = useAsyncDep2<string, number, string>(
    lastSuccess,
    y,
    prev => async (name: string, y: number) => `lastSuccess: ${name}, y: ${y}`
  );
  return (
    <Demo title="Async">
      <AsyncStateView
        name="AsyncInput"
        async={asyncInput}
        onClick={() => asyncInput.await(asyncRandom())}
      />
      <AsyncStateView
        name="AsyncFun0"
        async={asyncFun0}
        onClick={() => asyncFun0.call()}
      />
      <AsyncStateView
        name="AsyncFun1"
        async={asyncFun1}
        onClick={() => asyncFun1.call(x)}
      />
      <AsyncStateView
        name="AsyncFun2"
        async={asyncFun2}
        onClick={() => asyncFun2.call(x, y)}
      />
      <AsyncStateView
        name="AsyncFunUnstable"
        async={asyncFunUnstable}
        onClick={() => asyncFunUnstable.call(x)}
      />
      <hr />
      Last success: {lastSuccess.state}
      <br />
      Last failure: {lastFailure.state.message}
      <AsyncStateView name="asyncDep" async={asyncDep} />
      <AsyncStateView name="asyncDep2" async={asyncDep2} />
    </Demo>
  );
};

const AsyncStateView: FC<{
  name: string;
  async: Pure<AsyncState<any>>;
  onClick?: () => void;
}> = ({ name, async, onClick }) => {
  return (
    <div className="block">
      {onClick ? (
        <button onClick={onClick}>{name}</button>
      ) : (
        <>
          <hr />
          {name}:
        </>
      )}
      <br />
      Status: {async.state.status}
      <br />
      Success: {async.state.success}
      <br />
      Failure: {async.state.failure && async.state.failure.message}
    </div>
  );
};

export default DemoAsync;
