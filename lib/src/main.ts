import isFunction from 'lodash/isFunction';
import { useDebugValue, useMemo, useState } from 'react';
// @ts-ignore
import * as re from 'reupdate';
// @ts-ignore
import stringify from 'stringify-object';

export type Predicate<A> = (s: A) => boolean;

export interface State<S> {
  readonly state: S;
}

// TODO: immutability

/*********************************************************
 * Utility hooks
 * *******************************************************/

export const useDebug = (value: any): void => {
  useDebugValue(
    stringify(value, {
      indent: ' ',
      inlineCharacterLimit: 500,
      transform: (obj: any, prop: string, str: string) => {
        if (str.startsWith('function ')) {
          return 'f';
        } else return str;
      }
    })
  );
};

// todo?: useDebugEffect

/*********************************************************
 * Read-Only state
 * *******************************************************/
export const constState: <S>(state: S) => State<S> = state => ({
  state
});

/*********************************************************
 * Input state hooks
 * *******************************************************/
export interface In<S> extends State<S> {
  set: (state: S) => void;
  update: (upd: (prev: S) => S) => void;
}

export type Lazy<S> = () => S;

export type Initial<S> = S | Lazy<S>;

export const useInState = <S>(initialState: Initial<S>): In<S> => {
  if (isFunction(initialState)) {
    /** Lazy evaluation of initial state */
    initialState = initialState();
  }
  const [state, setState] = useState<S>(initialState);
  const set = (newState: S): void => {
    /** ReUpdate state to new state */
    setState(() => re.set(state, newState));
  };
  const update = (upd: (prev: S) => S): void => {
    /** Make ReUpdater */
    const reUpd = (prev: S): S => re.set(state, upd(prev));
    setState(reUpd);
  };
  return { state, set, update };
};

/*********************************************************
 * Dependent state hooks
 * *******************************************************/
export const useDepState = <D, S>(
  dep: State<D>,
  compute: (depState: D) => S
): State<S> => {
  const [state, setState] = useState(() => compute(dep.state));
  const newState = useMemo(() => compute(dep.state), [dep.state]);
  /** ReUpdate state to new state */
  const reNewState = re.set(state, newState);
  if (reNewState !== state) {
    setState(() => reNewState);
  }
  return { state };
};
export const useDepState2 = <D1, D2, S>(
  d1: State<D1>,
  d2: State<D2>,
  compute: (d1: D1, d2: D2) => S
): State<S> => {
  const [state, setState] = useState(() => compute(d1.state, d2.state));
  const newState = useMemo(() => compute(d1.state, d2.state), [
    d1.state,
    d2.state
  ]);
  /** ReUpdate state to new state */
  const reNewState = re.set(state, newState);
  if (reNewState !== state) {
    setState(() => reNewState);
  }
  return { state };
};
// todo: useDepState3, useDepState4, ...

export const useDepStates = <D, S>(
  deps: State<D>[],
  compute: (depsStates: D[]) => S
): State<S> => {
  const [state, setState] = useState(() => compute(deps.map(d => d.state)));
  const newState = useMemo(
    () => compute(deps.map(d => d.state)),
    deps.map(d => d.state)
  );
  /** ReUpdate state to new state */
  const reNewState = re.set(state, newState);
  if (reNewState !== state) {
    setState(() => reNewState);
  }
  return { state };
};

/*********************************************************
 * Reuse helpers
 * *******************************************************/
export const reuse = <A, R>(compute: (a: A) => R) => (a: State<A>): State<R> =>
  useDepState(a, compute);

export const reuse2 = <A, B, R>(compute: (a: A, b: B) => R) => (
  a: State<A>,
  b: State<B>
): State<R> => useDepState2(a, b, compute);
// todo: reuse3, reuse4, ...

export const reuseAll = <D, S>(compute: (depsStates: D[]) => S) => (
  deps: State<D>[]
): State<S> => useDepStates(deps, compute);

/*********************************************************
 * Errors
 * *******************************************************/
// TODO: Replace with useConstraint<S, E = ConstraintError>(State<S>, State<Predicate<S>>):State<S | E>
//
// export class OutOfDomain<S> extends Error {
//   public state: S;
//   constructor(state: S) {
//     super(`State out of domain: ${state}`);
//     this.state = state;
//   }
// }
//
// // todo: better name instead of domain: MaybeInDomain
// export type Domain<S> = S | OutOfDomain<S>;
//
// export interface InStateInDomain<S> extends State<Domain<S>> {
//   set: (state: S) => void;
//   update: (upd: (prev: S) => S) => void;
//   predicate: Predicate<S>;
// }
//
// export const useInStateInDomain = <S>(
//   initialState: Initial<S>,
//   domain: State<Predicate<S>>
// ): InStateInDomain<S> => {
//   const input = useInState<S>(initialState);
//   const dep = useDepState2<S, Predicate<S>, S | OutOfDomain<S>>(
//     input,
//     domain,
//     (input, domain) => (domain(input) ? input : new OutOfDomain(input))
//   );
//   return {
//     state: dep.state,
//     set: input.set,
//     update: input.update,
//     predicate: domain.state
//   };
// };
//
// export interface InStateAllowed<S> extends InStateInDomain<S> {
//   allowed: S[];
// }
//
// export const useInStateAllowed = <S>(
//   initialState: S,
//   allowed: State<S[]>,
//   isEqual: (a: S, b: S) => boolean
// ): InStateAllowed<S> => {
//   const input = useInState<S>(initialState);
//   const dep = useDepState2<
//     S,
//     S[],
//     { predicate: Predicate<S>; either: Domain<S> }
//   >(input, allowed, (input, allowed) => {
//     const isAllowed: Predicate<S> = s =>
//       isEqual
//         ? allowed.findIndex(d => isEqual(s, d)) !== -1
//         : allowed.includes(s);
//     return {
//       predicate: isAllowed,
//       either: isAllowed(input) ? input : new OutOfDomain(input)
//     };
//   });
//   return {
//     state: dep.state.either,
//     set: input.set,
//     update: input.update,
//     allowed: allowed.state,
//     predicate: dep.state.predicate
//   };
// };

/*********************************************************
 * Maybe hooks
 * *******************************************************/

export type Maybe<T> = T | undefined;

export const useFromMaybe = <A>(
  maybe: State<Maybe<A>>,
  dflt: State<A>
): State<A> => useDepState2(maybe, dflt, (maybe, dflt) => maybe || dflt);

/*********************************************************
 * OOP hooks
 * *******************************************************/

export const useMethod = <T, A, R>(
  self: State<T>,
  method: (arg: A, self: T) => R,
  arg: State<A>
): State<R> =>
  useDepState2(self, arg, (self, arg) => method.bind(self)(arg, self));

/*********************************************************
 * Array hooks
 * *******************************************************/

// export const reuseReduce = <A, R>(
//   initial: R,
//   reduce: (acc: R, arg: A) => R
// ) => (...args: State<A>[]): State<R> =>
//   useDepStates(args, (args: A[]) => args.reduce(reduce, initial));

// TODO: reuseReduceObj
export const reuseReduce = <A, R>(
  initial: R,
  reduce: (acc: R, arg: A, index: number) => R
) => (...args: State<A>[]): State<R> => useReduce(args, initial, reduce);

export const useReduce = <A, R>(
  args: State<A>[],
  initial: R,
  reduce: (acc: R, arg: A, index: number) => R
): State<R> => useDepStates(args, (args: A[]) => args.reduce(reduce, initial));

// TODO: reuseMapObj
export const reuseMap = <A, B>(map: (arg: A, index: number) => B) => (
  ...args: State<A>[]
): State<B[]> => useMap(args, map);

export const useMap = <A, B>(
  args: State<A>[],
  map: (arg: A, index: number) => B
): State<B[]> => useDepStates(args, (args: A[]) => args.map(map));

// TODO: reuseFilterObj
export const reuseFilter = <S>(
  filter: (arg: S, index: number, array: S[]) => boolean
) => (...args: State<S>[]): State<S[]> => useFilter(args, filter);

export const useFilter = <S>(
  args: State<S>[],
  filter: (arg: S, index: number, array: S[]) => boolean
): State<S[]> => useDepStates(args, (args: S[]) => args.filter(filter));

// todo: Iterable instead of Array?
export const useFind = <S>(
  array: State<S[]>,
  predicate: State<Predicate<S>>
): State<Maybe<S>> => useMethod(array, array.state.find, predicate);
// todo: Other array functions
