import isFunction from 'lodash/isFunction';
import { useDebugValue, useMemo, useState } from 'react';
// @ts-ignore
import * as re from 'reupdate';
// @ts-ignore
import stringify from 'stringify-object';

export type Predicate<A> = (s: A) => boolean;

export class Stateful<S> {
  private readonly s: S;
  constructor(state: S) {
    this.s = state;
  }
  get state(): S {
    return this.s;
  }
}

export type OrStateful<S> = S | Stateful<S>;
export type AndStateful<S> = S & Stateful<S>;

export const getState = <S>(state: OrStateful<S>): S =>
  state instanceof Stateful ? state.state : state;

export const andState = <S>(st: Stateful<S>): AndStateful<S> => {
  return new Proxy<Stateful<S>>(st, {
    get(target: Stateful<S>, name: string) {
      if (name === 'state') return target.state;
      else return target.state[name];
    },
    getOwnPropertyDescriptor(
      target: Stateful<S>,
      name: string | number | symbol
    ): PropertyDescriptor | undefined {
      return Object.getOwnPropertyDescriptor(target.state, name);
    },
    ownKeys(target: Stateful<S>) {
      return Object.keys(target.state);
    }
  }) as AndStateful<S>;
};

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
export const constState: <S>(state: S) => AndStateful<S> = state =>
  andState(new Stateful(state));

/*********************************************************
 * Input (independent writeable) state hooks
 * *******************************************************/
type SetState<S> = (state: S) => void;
type UpdateState<S> = (upd: (prev: S) => S) => void;

export class Input<S> extends Stateful<S> {
  readonly set: SetState<S>;
  readonly update: UpdateState<S>;
  constructor(state: S, set: SetState<S>, update: UpdateState<S>) {
    super(state);
    this.set = set;
    this.update = update;
  }
}

export type Lazy<S> = () => S;
export type Initial<S> = S | Lazy<S>;

export const useInput = <S>(initialState: Initial<S>): Input<S> => {
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
  return new Input(state, set, update);
};

/*********************************************************
 * Dependent state hooks
 * *******************************************************/
export const useDep = <D, S>(
  dep: OrStateful<D>,
  compute: (depState: D) => S
): AndStateful<S> => {
  const [state, setState] = useState(() => compute(getState(dep)));
  const newState = useMemo(() => compute(getState(dep)), [getState(dep)]);
  /** ReUpdate state to new state */
  const reNewState = re.set(state, newState);
  if (reNewState !== state) {
    setState(() => reNewState);
  }
  return andState(new Stateful(state));
};
export const useDep2 = <D1, D2, S>(
  d1: OrStateful<D1>,
  d2: OrStateful<D2>,
  compute: (d1: D1, d2: D2) => S
): AndStateful<S> => {
  const [state, setState] = useState(() => compute(getState(d1), getState(d2)));
  const newState = useMemo(() => compute(getState(d1), getState(d2)), [
    getState(d1),
    getState(d2)
  ]);
  /** ReUpdate state to new state */
  const reNewState = re.set(state, newState);
  if (reNewState !== state) {
    setState(() => reNewState);
  }
  return andState(new Stateful(state));
};
// todo: useDepState3, useDepState4, ...

export const useDeps = <D, S>(
  deps: OrStateful<D>[],
  compute: (depsStates: D[]) => S
): AndStateful<S> => {
  const [state, setState] = useState(() => compute(deps.map(getState)));
  const newState = useMemo(
    () => compute(deps.map(getState)),
    deps.map(getState)
  );
  /** ReUpdate state to new state */
  const reNewState = re.set(state, newState);
  if (reNewState !== state) {
    setState(() => reNewState);
  }
  return andState(new Stateful(state));
};

/*********************************************************
 * Reuse helpers
 * *******************************************************/
export const reuseDep = <A, R>(compute: (a: A) => R) => (
  a: OrStateful<A>
): AndStateful<R> => useDep(a, compute);

export const reuseDep2 = <A, B, R>(compute: (a: A, b: B) => R) => (
  a: OrStateful<A>,
  b: OrStateful<B>
): AndStateful<R> => useDep2(a, b, compute);
// todo: reuseDep3, reuseDep4, ...

export const reuseDeps = <D, S>(compute: (depsStates: D[]) => S) => (
  deps: OrStateful<D>[]
): AndStateful<S> => useDeps(deps, compute);

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
  maybe: OrStateful<Maybe<A>>,
  dflt: OrStateful<A>
): AndStateful<A> => useDep2(maybe, dflt, (maybe, dflt) => maybe || dflt);

/*********************************************************
 * OOP hooks
 * *******************************************************/

export const useMethod = <T, A, R>(
  self: OrStateful<T>,
  method: (arg: A, self: T) => R,
  arg: OrStateful<A>
): AndStateful<R> =>
  useDep2(self, arg, (self, arg) => method.bind(self)(arg, self));

/*********************************************************
 * Array hooks
 * *******************************************************/

// TODO: reuseReduceObj
export const reuseReduce = <A, R>(
  initial: R,
  reduce: (acc: R, arg: A, index: number) => R
) => (...args: OrStateful<A>[]): AndStateful<R> =>
  useReduce(args, initial, reduce);

export const useReduce = <A, R>(
  args: OrStateful<A>[],
  initial: R,
  reduce: (acc: R, arg: A, index: number) => R
): AndStateful<R> => useDeps(args, (args: A[]) => args.reduce(reduce, initial));

// TODO: reuseMapObj
export const reuseMap = <A, B>(map: (arg: A, index: number) => B) => (
  ...args: OrStateful<A>[]
): AndStateful<B[]> => useMap(args, map);

export const useMap = <A, B>(
  args: OrStateful<A>[],
  map: (arg: A, index: number) => B
): AndStateful<B[]> => useDeps(args, (args: A[]) => args.map(map));

// TODO: reuseFilterObj
export const reuseFilter = <S>(
  filter: (arg: S, index: number, array: S[]) => boolean
) => (...args: OrStateful<S>[]): AndStateful<S[]> => useFilter(args, filter);

export const useFilter = <S>(
  args: OrStateful<S>[],
  filter: (arg: S, index: number, array: S[]) => boolean
): AndStateful<S[]> => useDeps(args, (args: S[]) => args.filter(filter));

// todo: Iterable instead of Array?
export const useFind = <S>(
  array: OrStateful<S[]>,
  predicate: OrStateful<Predicate<S>>
): AndStateful<Maybe<S>> => useMethod(array, getState(array).find, predicate);
// todo: Other array functions
