import { useState } from 'react';
// @ts-ignore
import * as re from 'reupdate';

// TODO: TypeScript bug issue: plain object as class instance

// TODO: async.ts: useAsync(n), useLastSuccess, useLastError
// todo?: entity.ts: useEntity

export type Lazy<S> = () => S;
export type Initial<S> = S | Lazy<S>;
export type Predicate<A> = (s: A) => boolean;

export class Stateful<S> {
  // TODO: immutability of state.**
  readonly state: S;
  constructor(initialState: Initial<S>) {
    this.state =
      initialState instanceof Function ? initialState() : initialState;
  }
}

/*********************************************************
 * Read-Only state
 * *******************************************************/
export const constant: <S>(state: S) => AndState<S> = state =>
  andState(new Stateful(state));

/*********************************************************
 * Protected writable stateful
 * E.g. usage: useAsync
 * *******************************************************/
export class Writable<S> extends Stateful<S> {
  private readonly _setState: (newState: S | ((newState: S) => S)) => void;
  constructor(initialState: Initial<S>) {
    const [state, setState] = useState<S>(initialState);
    super(state);
    this._setState = setState;
  }
  protected updateState(upd: (newState: S) => S) {
    // TODO: Test, type and fix re.set() for class instances
    const newState = upd(this.state);
    const reallyNewState: S = re.set(this.state, newState);
    // const change = {
    //   reallyNewState,
    //   state
    // };
    if (reallyNewState !== this.state) {
      // console.log('Changed:', change);
      this._setState(reallyNewState);
      // this._state = reallyNewState;
    } //else console.log('Not changed:', change);
  }
}

/*********************************************************
 * Input (independent writeable) state hooks
 * *******************************************************/
export class Input<S> extends Writable<S> {
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
 * Helpers
 * *******************************************************/
export const readOnly = <S>(st: Stateful<S>): Stateful<S> =>
  new Stateful(st.state);

// TODO: Conditional types for better typing (object vs primitives)?
export type OrState<S> = S | Stateful<S>;
export type AndState<S> = S & Stateful<S>;

export const getState = <S>(state: OrState<S>): S =>
  state instanceof Stateful ? state.state : state;

// todo: Support T extends Stateful<S>
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

export const andStateRO = <S>(st: Stateful<S>): AndState<S> =>
  andState(readOnly(st));
