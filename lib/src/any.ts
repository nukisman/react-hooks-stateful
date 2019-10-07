import { OrState, AndState } from './core';
import { reuseReduce } from './array';

export const useEq = (
  a: OrState<any>,
  b: OrState<any>,
  ...rest: OrState<any>[]
): AndState<boolean> =>
  reuseReduce(a === b, (acc: boolean, value: any) => acc && a === value)(
    ...rest
  );
