import { Writable, OrState, AndState, getState, andStateRO } from './core';
import { useDep2 } from './dep';
import { Maybe } from './maybe';
import { useEffect } from 'react';

export enum Status {
  Reset = 'Reset',
  Await = 'Await',
  Success = 'Success',
  Failure = 'Failure'
}
export type AsyncState<S> = {
  readonly status: Status;
  readonly reset: number;
  readonly isInit: boolean;
  readonly success: Maybe<S>;
  readonly failure: Maybe<Error>;
};

// todo?: defaultSuccess
// todo?: defaultError
const initialState = <S>(): AsyncState<S> => ({
  status: Status.Reset,
  reset: 0,
  isInit: true,
  success: undefined,
  failure: undefined
});

/*********************************************************
 * Asynchronously writable state holder
 * *******************************************************/
// todo?: Update request queueing (takeDirty (no queueing), takeEvery, takeLatest, ...)
// TODO: Cancel running await
type Options<S> = { runOnInit?: Promise<S> };
export class Async<S> extends Writable<AsyncState<S>> {
  constructor(options: Options<S> = {}) {
    super(initialState());
    if (this.state.isInit && options.runOnInit) this.await(options.runOnInit);
  }
  protected await(promise: Promise<S>) {
    this.updateState(s => ({
      ...s,
      status: Status.Await,
      isInit: false
    }));
    promise.then(
      (success: S) => {
        // console.log({ success });
        this.updateState(s => ({
          ...s,
          status: Status.Success,
          success,
          isInit: false
        }));
      },
      (failure: Error) => {
        // console.log({ failure });
        this.updateState(s => ({
          ...s,
          status: Status.Failure,
          failure,
          isInit: false
        }));
      }
    );
  }
  protected reset() {
    this.updateState(s => ({
      ...s,
      status: Status.Reset,
      reset: s.reset + 1,
      isInit: false
    }));
  }
}

/*********************************************************
 * AsyncInput
 * *******************************************************/
export class AsyncInput<S> extends Async<S> {
  public await(promise: Promise<S>) {
    super.await(promise);
  }
  public reset() {
    super.reset();
  }
}
export const useAsyncInput = <S>() => new AsyncInput<S>();

/*********************************************************
 * AsyncFun with 0 arguments
 * *******************************************************/
type Options0 = { runOnInit?: boolean };
export class AsyncFun0<A, S> extends Async<S> {
  private readonly fun: (prev: AsyncState<S>) => () => Promise<S>;
  constructor(
    fun: (prev: AsyncState<S>) => () => Promise<S>,
    options: Options0 = {}
  ) {
    super();
    this.fun = fun;
    if (this.state.isInit && options.runOnInit) this.call();
  }
  call() {
    this.await(this.fun(this.state)());
  }
}
export const useAsyncFun0 = <S>(
  fun: (prev: AsyncState<S>) => () => Promise<S>,
  options: Options0 = {}
) => new AsyncFun0(fun, options);

/*********************************************************
 * AsyncFun with 1 arguments
 * *******************************************************/
type Options1<A> = { runOnInit?: [A] };
export class AsyncFun1<A, S> extends Async<S> {
  private readonly fun: (prev: AsyncState<S>) => (a: A) => Promise<S>;
  constructor(
    fun: (prev: AsyncState<S>) => (arg: A) => Promise<S>,
    options: Options1<A> = {}
  ) {
    super();
    this.fun = fun;
    if (this.state.isInit && options.runOnInit) this.call(...options.runOnInit);
  }
  call(arg: OrState<A>) {
    this.await(this.fun(this.state)(getState(arg)));
  }
}
export const useAsyncFun1 = <A, S>(
  fun: (prev: AsyncState<S>) => (arg: A) => Promise<S>,
  options: Options1<A> = {}
) => new AsyncFun1(fun, options);

/*********************************************************
 * AsyncFun with 2 arguments
 * *******************************************************/
type Options2<A, B> = { runOnInit?: [A, B] };
export class AsyncFun2<A, B, S> extends Async<S> {
  private readonly fun: (prev: AsyncState<S>) => (a: A, b: B) => Promise<S>;
  constructor(
    fun: (prev: AsyncState<S>) => (a: A, b: B) => Promise<S>,
    options: Options2<A, B> = {}
  ) {
    super();
    this.fun = fun;
    if (this.state.isInit && options.runOnInit) this.call(...options.runOnInit);
  }
  call(a: OrState<A>, b: OrState<B>) {
    this.await(this.fun(this.state)(getState(a), getState(b)));
  }
}
export const useAsyncFun2 = <A, B, S>(
  fun: (prev: AsyncState<S>) => (a: A, b: B) => Promise<S>,
  options: Options2<A, B> = {}
) => new AsyncFun2(fun, options);

/*********************************************************
 * AsyncFun with 3 arguments
 * *******************************************************/
type Options3<A, B, C> = { runOnInit?: [A, B, C] };
export class AsyncFun3<A, B, C, S> extends Async<S> {
  private readonly fun: (
    prev: AsyncState<S>
  ) => (a: A, b: B, c: C) => Promise<S>;
  constructor(
    fun: (prev: AsyncState<S>) => (a: A, b: B, c: C) => Promise<S>,
    options: Options3<A, B, C> = {}
  ) {
    super();
    this.fun = fun;
    if (this.state.isInit && options.runOnInit) this.call(...options.runOnInit);
  }
  call(a: OrState<A>, b: OrState<B>, c: OrState<C>) {
    this.await(this.fun(this.state)(getState(a), getState(b), getState(c)));
  }
}
export const useAsyncFun3 = <A, B, C, S>(
  fun: (prev: AsyncState<S>) => (a: A, b: B, c: C) => Promise<S>,
  options: Options3<A, B, C> = {}
) => new AsyncFun3(fun, options);

/*********************************************************
 * Last successful state of async state
 * *******************************************************/
export const useSuccess = <S>(
  dep: OrState<AsyncState<S>>,
  defaultSuccess?: OrState<Maybe<S>>,
  mapSuccess?: (s: Maybe<S>) => Maybe<S>
): AndState<Maybe<S>> => {
  return useDep2(dep, defaultSuccess, (dep, defaultSuccess) => {
    const lastSuccess = dep.success || defaultSuccess;
    return mapSuccess ? mapSuccess(lastSuccess) : lastSuccess;
  });
};

/*********************************************************
 * Last failure state of async state
 * *******************************************************/
export const useFailure = (
  dep: OrState<AsyncState<any>>,
  defaultFailure: OrState<Maybe<Error>>,
  mapFailure?: (s: Maybe<Error>) => Maybe<Error>
): AndState<Maybe<Error>> => {
  return useDep2(dep, defaultFailure, (dep, defaultFailure) => {
    const last = dep.failure || defaultFailure;
    return mapFailure ? mapFailure(last) : last;
  });
};

/*********************************************************
 * Dependent state hooks with asynchronous computations
 * *******************************************************/
export const useAsyncDep = <D, S>(
  dep: OrState<D>,
  compute: (prev: AsyncState<S>) => (depState: D) => Promise<S>
): AndState<AsyncState<S>> => {
  const deps: [D] = [getState(dep)];
  const asyncFun = useAsyncFun1<D, S>(compute, { runOnInit: deps });
  useEffect(() => {
    asyncFun.call(...deps);
  }, deps);
  return andStateRO(asyncFun);
};

export const useAsyncDep2 = <D1, D2, S>(
  d1: OrState<D1>,
  d2: OrState<D2>,
  compute: (prev: AsyncState<S>) => (d1: D1, d2: D2) => Promise<S>
): AndState<AsyncState<S>> => {
  const deps: [D1, D2] = [getState(d1), getState(d2)];
  const asyncFun = useAsyncFun2<D1, D2, S>(compute, {
    runOnInit: deps
  });
  useEffect(() => {
    asyncFun.call(...deps);
  }, deps);
  return andStateRO(asyncFun);
};

export const useAsyncDep3 = <D1, D2, D3, S>(
  d1: OrState<D1>,
  d2: OrState<D2>,
  d3: OrState<D3>,
  compute: (prev: AsyncState<S>) => (d1: D1, d2: D2, d3: D3) => Promise<S>
): AndState<AsyncState<S>> => {
  const deps: [D1, D2, D3] = [getState(d1), getState(d2), getState(d3)];
  const asyncFun = useAsyncFun3<D1, D2, D3, S>(compute, {
    runOnInit: deps
  });
  useEffect(() => {
    asyncFun.call(...deps);
  }, deps);
  return andStateRO(asyncFun);
};
