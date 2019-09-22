import isFunction from 'lodash/isFunction';
import { useDebugValue, useMemo, useState } from 'react';
// @ts-ignore
import * as re from 'reupdate';
// @ts-ignore
import stringify from 'stringify-object';
import { Maybe } from './utils';

export interface State<S> {
  state: S;
}

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

// todo: useDebugEffect

// export const DepPropTypes = {};
// DepPropTypes.state = (stateType = PropTypes.any) =>
//   PropTypes.shape({ state: stateType });

/*********************************************************
 * Read-Only state
 * *******************************************************/

// DepPropTypes.constState = DepPropTypes.state;

export const constState: <S>(state: S) => State<S> = state => ({
  state
});

/*********************************************************
 * Input state hooks
 * *******************************************************/

// DepPropTypes.inState = (stateType = PropTypes.any, extType = {}) =>
//   PropTypes.shape({
//     ...extType,
//     state: stateType
//   });
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

export type Predicate<S> = (s: S) => boolean;

export class OutOfDomain<S> extends Error {
  public state: S;
  constructor(state: S) {
    super(`State out of domain: ${state}`);
    this.state = state;
  }
}

// todo: better name instead of domain: MaybeInDomain
export type Domain<S> = S | OutOfDomain<S>;

export interface InStateInDomain<S> extends State<Domain<S>> {
  set: (state: S) => void;
  update: (upd: (prev: S) => S) => void;
  predicate: Predicate<S>;
}

export const useInStateInDomain = <S>(
  initialState: Initial<S>,
  domain: State<Predicate<S>>
): InStateInDomain<S> => {
  const input = useInState<S>(initialState);
  const dep = useDepState2<S, Predicate<S>, S | OutOfDomain<S>>(
    input,
    domain,
    (input, domain) => (domain(input) ? input : new OutOfDomain(input))
  );
  return {
    state: dep.state,
    set: input.set,
    update: input.update,
    predicate: domain.state
  };
};

export interface InStateAllowed<S> extends InStateInDomain<S> {
  allowed: S[];
}

export const useInStateAllowed = <S>(
  initialState: S,
  allowed: State<S[]>,
  isEqual: (a: S, b: S) => boolean
): InStateAllowed<S> => {
  const input = useInState<S>(initialState);
  const dep = useDepState2<
    S,
    S[],
    { predicate: Predicate<S>; either: Domain<S> }
  >(input, allowed, (input, allowed) => {
    const isAllowed: Predicate<S> = s =>
      isEqual
        ? allowed.findIndex(d => isEqual(s, d)) !== -1
        : allowed.includes(s);
    return {
      predicate: isAllowed,
      either: isAllowed(input) ? input : new OutOfDomain(input)
    };
  });
  return {
    state: dep.state.either,
    set: input.set,
    update: input.update,
    allowed: allowed.state,
    predicate: dep.state.predicate
  };
};

/*********************************************************
 * Dependent state hooks
 * *******************************************************/
// DepPropTypes.depState = DepPropTypes.state;
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

/*********************************************************
 * JS Operators hooks
 * *******************************************************/
export const createUno = <A, R>(compute: (a: A) => R) => (
  a: State<A>
): State<R> => {
  // tslint:disable-next-line:react-hooks-nesting
  return useDepState(a, compute);
};

export const createBin = <A, B, R>(compute: (a: A, b: B) => R) => (
  a: State<A>,
  b: State<B>
): State<R> => {
  // tslint:disable-next-line:react-hooks-nesting
  return useDepState2(a, b, compute);
};

export const useEq = createBin((a: any, b: any) => a === b);

export const useAnd = createBin((a, b) => a && b);

export const useOr = createBin((a, b) => a || b);

// todo: xor
// todo: Bitwise operators
// todo: Object property by name
// todo: [...arr1, ...arr2]
// todo: {...obj1, ...obj2}

/** JS Operators hooks: string */

export const useConcat = createBin((a: string, b: string) => a + b);

/** JS Operators hooks: boolean */

export const useNot = createUno(a => !a);

/** JS Operators hooks: number */

export const useNeg = createUno((a: number) => -a);

export const useSum = createBin((a: number, b: number) => a + b);
export const useDiff = createBin((a: number, b: number) => a - b);
export const useProd = createBin((a: number, b: number) => a * b);
export const useDiv = createBin((a: number, b: number) => a / b);

export const useLte = createBin((a: number, b: number) => a <= b);
export const useLt = createBin((a: number, b: number) => a < b);
export const useGte = createBin((a: number, b: number) => a >= b);
export const useGt = createBin((a: number, b: number) => a > b);

/*********************************************************
 * Maybe hooks
 * *******************************************************/

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

// todo: Iterable instead of Array?
export const useFind = <S>(
  array: State<S[]>,
  predicate: State<Predicate<S>>
): State<Maybe<S>> => useMethod(array, array.state.find, predicate);
// todo: Other array functions
