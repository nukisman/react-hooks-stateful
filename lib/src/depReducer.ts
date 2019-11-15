import { getState, OrState, useInput } from './core';
import { useMemo } from 'react';

/*********************************************************
 * Dependent state with initial value
 * *******************************************************/

// todo?: Return AndState<S>
export const useDepReducer3 = <D1, D2, D3, S>(
  initial: OrState<S>,
  d1: OrState<D1>,
  d2: OrState<D2>,
  d3: OrState<D3>,
  compute: (init: S, d1: D1, d2: D2, d3: D3) => S
): S => {
  const input = useInput(getState(initial));
  const factory = () =>
    compute(getState(input), getState(d1), getState(d2), getState(d3));
  return useMemo(factory, [
    getState(input),
    getState(d1),
    getState(d2),
    getState(d3)
  ]);
};
