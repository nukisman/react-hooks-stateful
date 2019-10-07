import { useMemo } from 'react';
import {
  AndState,
  andStateRO,
  getState,
  Input,
  OrState,
  useInput
} from './core';

/*********************************************************
 * Dependent state hooks
 * *******************************************************/
export const useDep = <D, S>(
  dep: OrState<D>,
  compute: (depState: D) => S
): AndState<S> => {
  const factory = () => compute(getState(dep));
  const input = new Input(factory);
  input.set(useMemo(factory, [getState(dep)]));
  return andStateRO(input);
};
export const useDep2 = <D1, D2, S>(
  d1: OrState<D1>,
  d2: OrState<D2>,
  compute: (d1: D1, d2: D2) => S
): AndState<S> => {
  const factory = () => compute(getState(d1), getState(d2));
  const input = useInput(factory);
  input.set(useMemo(factory, [getState(d1), getState(d2)]));
  return andStateRO(input);
};
export const useDep3 = <D1, D2, D3, S>(
  d1: OrState<D1>,
  d2: OrState<D2>,
  d3: OrState<D3>,
  compute: (d1: D1, d2: D2, d3: D3) => S
): AndState<S> => {
  const factory = () => compute(getState(d1), getState(d2), getState(d3));
  const input = useInput(factory);
  input.set(useMemo(factory, [getState(d1), getState(d2), getState(d3)]));
  return andStateRO(input);
};
// todo: useDep4, useDep5, ...

export const useDeps = <D, S>(
  deps: OrState<D>[],
  compute: (depsStates: D[]) => S
): AndState<S> => {
  const factory = () => compute(deps.map(getState));
  const input = useInput(factory);
  input.set(useMemo(factory, deps.map(getState)));
  return andStateRO(input);
};

/*********************************************************
 * Reuse helpers
 * *******************************************************/
export const reuseDep = <A, R>(compute: (a: A) => R) => (
  a: OrState<A>
): AndState<R> => useDep(a, compute);

export const reuseDep2 = <A, B, R>(compute: (a: A, b: B) => R) => (
  a: OrState<A>,
  b: OrState<B>
): AndState<R> => useDep2(a, b, compute);

export const reuseDep3 = <A, B, C, R>(compute: (a: A, b: B, c: C) => R) => (
  a: OrState<A>,
  b: OrState<B>,
  c: OrState<C>
): AndState<R> => useDep3(a, b, c, compute);
// todo: reuseDep4, reuseDep5, ...

export const reuseDeps = <D, S>(compute: (depsStates: D[]) => S) => (
  ...deps: OrState<D>[]
): AndState<S> => useDeps(deps, compute);
