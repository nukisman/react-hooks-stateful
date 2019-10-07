import { useState } from 'react';
// @ts-ignore
import * as re from 'reupdate';

// TODO: TypeScript bug issue: plain object as class instance

// todo?: entity.ts: useEntity

export type Lazy<S> = () => S;
export type Initial<S> = S | Lazy<S>;
export type Predicate<A> = (s: A) => boolean;

/** Pure, read only state holder */
export class Pure<S> {
  // TODO: immutability of state.**
  readonly state: S;
  constructor(initialState: Initial<S>) {
    this.state =
      initialState instanceof Function ? initialState() : initialState;
  }
}

/*********************************************************
 * Constant state.
 * Usually you should not use it, because of
 * widely usage parameters of type OrState.
 * *******************************************************/
export const constant: <S>(state: S) => AndState<S> = state =>
  andState(new Pure(state));

/*********************************************************
 * Protected writable stateful.
 * Not for direct usage. For internal inheriting.
 * E.g. see Input<S> and Async<S>
 * *******************************************************/
export class Writable<S> extends Pure<S> {
  private readonly _setState: (newState: S | ((newState: S) => S)) => void;
  constructor(initialState: Initial<S>) {
    const [state, setState] = useState<S>(initialState);
    super(state);
    this._setState = setState;
  }
  protected setState(newState: S) {
    // TODO: Test, type and fix re.set() for class instances
    const prev = this.state;
    const reallyNewState: S = re.set(prev, newState);
    // console.log(reallyNewState !== prev ? 'Changed:' : 'Not changed:', {
    //   reallyNewState,
    //   prev
    // });
    if (reallyNewState !== prev) {
      this._setState(reallyNewState);
      // this._state = reallyNewState;
    }
  }
  protected updateState(upd: (state: S) => S) {
    // console.log(this._setState);
    this._setState(prev => {
      const newState = upd(prev);
      const reallyNewState = re.set(prev, newState);
      // console.log(reallyNewState !== prev ? 'Changed:' : 'Not changed:', {
      //   reallyNewState,
      //   prev
      // });
      return reallyNewState === prev ? prev : reallyNewState;
    });
    // this.setState(upd(this.state));
  }
}

/*********************************************************
 * Input - writeable independent state
 * *******************************************************/
export class Input<S> extends Writable<S> {
  set(state: S) {
    this.setState(state);
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
export const readOnly = <S>(st: Pure<S>): Pure<S> => new Pure(st.state);

// TODO: Conditional types for better typing (object vs primitives)?
export type OrState<S> = S | Pure<S>;
export type AndState<S> = S & Pure<S>;

export const getState = <S>(state: OrState<S>): S =>
  state instanceof Pure ? state.state : state;

// todo: Support T extends Pure<S>
export const andState = <S>(st: Pure<S>): AndState<S> => {
  return new Proxy<Pure<S>>(st, {
    get(target: Pure<S>, name: string) {
      if (target[name]) return target[name];
      else return target.state && target.state[name];
    },
    getOwnPropertyDescriptor(
      target: Pure<S>,
      name: string | number | symbol
    ): PropertyDescriptor | undefined {
      return Object.getOwnPropertyDescriptor(target.state, name);
    },
    ownKeys(target: Pure<S>) {
      return Object.keys(target.state);
    }
  }) as AndState<S>;
};

export const andStateRO = <S>(st: Pure<S>): AndState<S> =>
  andState(readOnly(st));
