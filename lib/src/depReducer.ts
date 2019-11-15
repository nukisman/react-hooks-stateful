import { getState, OrState } from './core';
import { Reducer, useEffect, useReducer } from 'react';
import map from 'lodash/map';
// @ts-ignore
import * as re from 'reupdate';

/*********************************************************
 * Dependent state with initial value
 * *******************************************************/

type Red<S, Deps> = Reducer<{ value: S; deps: Deps }, Deps>;

// todo?: Return AndState<S>
export const useDepReducer3 = <D1, D2, D3, S>(
  initial: OrState<S>,
  d1: OrState<D1>,
  d2: OrState<D2>,
  d3: OrState<D3>,
  compute: (init: S, d1: D1, d2: D2, d3: D3) => S
): S => {
  const deps: [D1, D2, D3] = [getState(d1), getState(d2), getState(d3)];
  const [state, dispatch] = useReducer<Red<S, [D1, D2, D3]>>(
    (state, deps) => ({
      value: compute(state.value, ...deps),
      deps
    }),
    { value: getState(initial), deps }
  );
  const depStrings = (deps: any[]) =>
    deps.map(d =>
      Array.isArray(d)
        ? String(d)
        : typeof d === 'object'
        ? `{${map(d as any, (v, k) => `${k}:(${v})`)}}`
        : String(d)
    );
  const reDeps: [D1, D2, D3] = re.set(state.deps, deps);
  console.log('deps  ', depStrings(deps));
  console.log('reDeps', depStrings(reDeps));
  console.log('deps changed:', deps !== reDeps);
  // FIXME: re.set
  // useEffect(() => dispatch(deps), reDeps);
  return state.value;
};
