import { Writable, OrState } from './core';

export enum Status {
  Reset,
  Await,
  Success,
  Failure
}
export type AsyncState<S> = {
  status: Status;
  reset: number;
  isInit: boolean;
  success: S | undefined;
  failure: Error | undefined;
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
 * Async Stateful
 * *******************************************************/
type Options<S> = { runOnInit?: Promise<S> };
export class Async<S> extends Writable<AsyncState<S>> {
  constructor(options: Options<S> = {}) {
    super(initialState());
    if (this.state.isInit && options.runOnInit) this.await(options.runOnInit);
  }
  await(promise: Promise<S>) {
    this.setState({ ...this.state, status: Status.Await, isInit: false });
    promise
      .then((success: S) => {
        this.setState({
          ...this.state,
          status: Status.Success,
          success,
          isInit: false
        });
      })
      .catch((e: Error) =>
        this.setState({
          ...this.state,
          status: Status.Failure,
          failure: e,
          isInit: false
        })
      );
  }
  reset() {
    this.setState({
      ...this.state,
      status: Status.Reset,
      reset: this.state.reset + 1,
      isInit: false
    });
  }
}
export const useAsync = <S>() => new Async<S>();

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
  private readonly fun: (prev: AsyncState<S>) => (a: OrState<A>) => Promise<S>;
  constructor(
    fun: (prev: AsyncState<S>) => (arg: OrState<A>) => Promise<S>,
    options: Options1<A> = {}
  ) {
    super();
    this.fun = fun;
    if (this.state.isInit && options.runOnInit) this.call(...options.runOnInit);
  }
  call(arg: OrState<A>) {
    this.await(this.fun(this.state)(arg));
  }
}
export const useAsyncFun1 = <A, S>(
  fun: (prev: AsyncState<S>) => (arg: OrState<A>) => Promise<S>,
  options: Options1<A> = {}
) => new AsyncFun1(fun, options);

/*********************************************************
 * AsyncFun with 2 arguments
 * *******************************************************/
type Options2<A, B> = { runOnInit?: [A, B] };
export class AsyncFun2<A, B, S> extends Async<S> {
  private readonly fun: (
    prev: AsyncState<S>
  ) => (a: OrState<A>, b: OrState<B>) => Promise<S>;
  constructor(
    fun: (prev: AsyncState<S>) => (a: OrState<A>, b: OrState<B>) => Promise<S>,
    options: Options2<A, B> = {}
  ) {
    super();
    this.fun = fun;
    if (this.state.isInit && options.runOnInit) this.call(...options.runOnInit);
  }
  call(a: OrState<A>, b: OrState<B>) {
    this.await(this.fun(this.state)(a, b));
  }
}
export const useAsyncFun2 = <A, B, S>(
  fun: (prev: AsyncState<S>) => (a: OrState<A>, b: OrState<B>) => Promise<S>,
  options: Options2<A, B> = {}
) => new AsyncFun2(fun, options);

// export interface DepPromise<Success, Failure extends Error>
//   extends State<Async<Success, Failure>> {}
//
// export interface InPromise<Arg, Success, Failure extends Error>
//   extends DepPromise<Success, Failure> {
//   set: (arg: Arg) => void;
//   reset: () => void;
// }

/*********************************************************
 * Dependent promise hooks
 * *******************************************************/

// const initialState: <Success, Failure extends Error>() => Async<
//   Success,
//   Failure
// > = () => ({
//   status: Status.Reset,
//   reset: 0,
//   isInit: true,
//   success: undefined,
//   failure: undefined
// });

// todo: Update request queueing (takeDirty (no queueing), takeEvery, takeLatest, ...)
// PromisePropTypes.inPromise = (
//   success = PropTypes.any,
//   failure = PropTypes.instanceOf(Error)
// ) =>
//   PromisePropTypes.promise(success, failure, {
//     set: PropTypes.func.isRequired,
//     reset: PropTypes.func.isRequired
//   });
// export const useInPromise = <Arg, Success, Failure extends Error>(
//   name: string,
//   runPromise: (arg: Arg) => Promise<Success | undefined>,
//   options?: { runOnInit?: { arg: Arg } }
// ): InPromise<Arg, Success, Failure> => {
//   options = options || {};
//   const prom = useInState<Async<Success, Failure>>(
//     initialState<Success, Failure>()
//   );
//   const set = (arg: Arg): void => {
//     prom.set({ ...prom.state, status: Status.Wip, isInit: false });
//     console.log(name, 'promise run');
//     runPromise(arg)
//       .then((success: Success | undefined) => {
//         prom.set({
//           ...prom.state,
//           status: Status.Success,
//           success,
//           isInit: false
//         });
//       })
//       .catch((e: Failure) =>
//         prom.set({
//           ...prom.state,
//           status: Status.Failure,
//           failure: e,
//           isInit: false
//         })
//       );
//   };
//
//   const reset = () =>
//     prom.set({
//       ...prom.state,
//       status: Status.Reset,
//       reset: prom.state.reset + 1,
//       isInit: false
//     });
//   if (prom.state.isInit && options.runOnInit) set(options.runOnInit.arg);
//   // console.log(name, 'promise state:', prom.state);
//   return { state: prom.state, set, reset };
// };
//
// // todo: useInPromise2, useInPromise3, ...
//
// // PromisePropTypes.lastSuccess = DepPropTypes.state;
// /** Last success of (In)dep promise */
// export const useLastSuccess = <Success, Failure extends Error>(
//   dep: State<Async<Success, Failure>>,
//   defaultSuccess: Success,
//   mapSuccess?: (s: Success) => Success
// ): State<Success> => {
//   return useDepState<Async<Success, Failure>, Success>(dep, depState => {
//     // console.log('lastSuccess', { dep });
//     const lastSuccess = depState.success || defaultSuccess;
//     return mapSuccess ? mapSuccess(lastSuccess) : lastSuccess;
//   });
// };

// todo: export const data = useDepPromise(deps, runOnDeps)
