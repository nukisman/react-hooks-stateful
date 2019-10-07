import { useState } from 'react';
// @ts-ignore
import * as re from 'reupdate';

// TODO: TypeScript bug issue: plain object as class instance

// TODO: async.ts: useAsync(n), useLastSuccess, useLastError

export type Lazy<S> = () => S;
export type Initial<S> = S | Lazy<S>;
export type Predicate<A> = (s: A) => boolean;

// TODO: Test and fix: mutate immutable Stateful
export class Stateful<S> {
  protected readonly s: [S, (newState: S | ((newState: S) => S)) => void];
  constructor(initialState: Initial<S>) {
    this.s = useState<S>(initialState);
  }
  get state(): S {
    const [state] = this.s;
    return state;
  }
  protected updateState(upd: (newState: S) => S) {
    const [state, setState] = this.s;
    // TODO: Test, (temporary disable) and fix re.set() for class instances
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

// TODO: Conditional types for better typing?
export type OrState<S> = S | Stateful<S>;
export type AndState<S> = S & Stateful<S>;

export const getState = <S>(state: OrState<S>): S =>
  state instanceof Stateful ? state.state : state;

export const andState = <S>(st: Stateful<S>): AndState<S> => {
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
  }) as AndState<S>;
};

// TODO: immutability

/*********************************************************
 * Read-Only state
 * *******************************************************/
export const constant: <S>(state: S) => AndState<S> = state =>
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
