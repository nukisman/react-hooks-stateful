import { useReducer, useEffect } from 'react';
import { Maybe } from './maybe';
import { OrState, AndState, constant, getState } from './core';

type ChangeState<S, C> = { state: Maybe<S>; change: C };

export const useChange = <S, C>(
  target: OrState<S>,
  initial: OrState<C>,
  compute: (prevState: S, state: S) => Maybe<C>
): AndState<C> => {
  const [{ change }, dispatch] = useReducer(
    (prev: ChangeState<S, C>, state: S): ChangeState<S, C> => {
      console.log('reducer', { prev, state });
      if (prev.state === undefined) {
        return { state, change: prev.change };
      } else {
        const change = compute(prev.state, state);
        if (change === undefined) return prev;
        else {
          console.log('change', change);
          return {
            state,
            change
          };
        }
      }
    },
    { state: undefined, change: getState(initial) }
  );
  const targetState = getState(target);
  useEffect(() => {
    dispatch(targetState);
  }, [targetState]);
  return constant(change);
};

// todo: useChange2, useChange3, ...
