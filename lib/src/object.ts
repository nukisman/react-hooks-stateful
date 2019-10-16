import { AndState, OrState, Writable } from './core';
import { useDep2 } from './dep';

export const reuseProp = <K extends string>(name: OrState<K>) => <
  S,
  T extends { [P in K]: S } = { [P in K]: S }
>(
  obj: OrState<T>
): AndState<S> =>
  useDep2<K, T, T[K]>(name, obj, (name: K, obj: T) => obj[name]);

export const reusePropOf = <K extends string>(name: OrState<K>) => <S>() => <
  T extends { [P in K]: S } = { [P in K]: S }
>(
  obj: OrState<T>
): AndState<S> => reuseProp<K>(name)<S, T>(obj);

export const useProp = <
  K extends string,
  S,
  T extends { [P in K]: S } = { [P in K]: S }
>(
  name: OrState<K>,
  obj: OrState<T>
): AndState<S> =>
  useDep2<K, T, T[K]>(name, obj, (name: K, obj: T) => obj[name]);

/** Spread objects */
export const useExtend = function<A, B>(
  objA: OrState<A>,
  objB: OrState<B>
): AndState<A & B> {
  return useDep2<A, B, A & B>(objA, objB, (objA: A, objB: B) => ({
    ...objA,
    ...objB
  }));
};

/*********************************************************
 * OOP hooks
 * *******************************************************/

export const useMethod = <T, A, R>(
  self: OrState<T>,
  method: (arg: A, self: T) => R,
  arg: OrState<A>
): AndState<R> =>
  useDep2(self, arg, (self, arg) => method.bind(self)(arg, self));

/*********************************************************
 * Other
 * *******************************************************/
export class Values<V, T extends { [key: string]: V }> extends Writable<T> {
  public setValue(key: keyof T, value: V) {
    this.updateState(state => ({ ...state, [key]: value }));
  }
}
