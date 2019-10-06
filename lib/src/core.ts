import { useDebugValue, useMemo, useState } from 'react';
// @ts-ignore
import * as re from 'reupdate';
// @ts-ignore
import stringify from 'stringify-object';

export type Lazy<S> = () => S;
export type Initial<S> = S | Lazy<S>;
export type Predicate<A> = (s: A) => boolean;

export class Stateful<S> {
  protected s: [S, (newState: S | ((newState: S) => S)) => void];
  constructor(initialState: Initial<S>) {
    this.s = useState<S>(initialState);
  }
  get state(): S {
    const [state] = this.s;
    return state;
  }
  protected updateState(upd: (newState: S) => S) {
    const [state, setState] = this.s;
    const reallyNewState: S = re.set(state, upd(state));
    // const change = {
    //   reallyNewState,
    //   state
    // };
    if (reallyNewState !== state) {
      // console.log('Changed:', change);
      setState(reallyNewState);
      // this._state = reallyNewState;
    } //else console.log('Not changed:', change);
  }
}

export type OrStateful<S> = S | Stateful<S>;
export type AndStateful<S> = S & Stateful<S>;

export const getState = <S>(state: OrStateful<S>): S =>
  state instanceof Stateful ? state.state : state;

export const andState = <S>(st: Stateful<S>): AndStateful<S> => {
  return new Proxy<Stateful<S>>(st, {
    get(target: Stateful<S>, name: string) {
      if (target[name]) return target[name];
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
export class Input<S> extends Stateful<S> {
  set(state: S) {
    this.updateState(() => state);
  }
  update(upd: (prev: S) => S) {
    this.updateState(upd);
  }
}

export const useInput = <S>(initialState: Initial<S>): Input<S> => {
  return new Input<S>(initialState);
};

/*********************************************************
 * Dependent state hooks
 * *******************************************************/
export const useDep = <D, S>(
  dep: OrStateful<D>,
  compute: (depState: D) => S
): AndStateful<S> => {
  const factory = () => compute(getState(dep));
  const input = new Input(factory);
  input.set(useMemo(factory, [getState(dep)]));
  return andState(input);
};
export const useDep2 = <D1, D2, S>(
  d1: OrStateful<D1>,
  d2: OrStateful<D2>,
  compute: (d1: D1, d2: D2) => S
): AndStateful<S> => {
  const factory = () => compute(getState(d1), getState(d2));
  const input = useInput(factory);
  input.set(useMemo(factory, [getState(d1), getState(d2)]));
  return andState(input);
};
export const useDep3 = <D1, D2, D3, S>(
  d1: OrStateful<D1>,
  d2: OrStateful<D2>,
  d3: OrStateful<D3>,
  compute: (d1: D1, d2: D2, d3: D3) => S
): AndStateful<S> => {
  const factory = () => compute(getState(d1), getState(d2), getState(d3));
  const input = useInput(factory);
  input.set(useMemo(factory, [getState(d1), getState(d2), getState(d3)]));
  return andState(input);
};
// todo: useDep4, useDep5, ...

export const useDeps = <D, S>(
  deps: OrStateful<D>[],
  compute: (depsStates: D[]) => S
): AndStateful<S> => {
  const factory = () => compute(deps.map(getState));
  const input = useInput(factory);
  input.set(useMemo(factory, deps.map(getState)));
  return andState(input);
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

export const reuseDep3 = <A, B, C, R>(compute: (a: A, b: B, c: C) => R) => (
  a: OrStateful<A>,
  b: OrStateful<B>,
  c: OrStateful<C>
): AndStateful<R> => useDep3(a, b, c, compute);
// todo: reuseDep4, reuseDep5, ...

export const reuseDeps = <D, S>(compute: (depsStates: D[]) => S) => (
  ...deps: OrStateful<D>[]
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
