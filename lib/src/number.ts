import { reuseDep, reuseDep2 } from './dep';
import { reuseReduce, useReduce } from './array';
import { OrState } from './core';

// todo: Bitwise operators

/** Negate number value */
export const useNeg = reuseDep((a: number) => -a);

/** 0 + ... */
export const useSum = reuseReduce(0, (acc: number, n: number) => acc + n);

/** a - b - ... */
export const useSub = (
  a: OrState<number>,
  b: OrState<number>,
  ...rest: OrState<number>[]
) => useReduce([b, ...rest], a, (acc: number, n: number) => acc - n);

/** 1 * ... */
export const useProd = reuseReduce(1, (acc, n: number) => acc * n);

/** a / b / ... */
export const useDiv = (
  a: OrState<number>,
  b: OrState<number>,
  ...rest: OrState<number>[]
) => useReduce([b, ...rest], a, (acc: number, n: number) => acc / n);

/** a <= b */
export const useLte = reuseDep2((a: number, b: number) => a <= b);

/** a < b */
export const useLt = reuseDep2((a: number, b: number) => a < b);

/** a >= b */
export const useGte = reuseDep2((a: number, b: number) => a >= b);

/** a > b */
export const useGt = reuseDep2((a: number, b: number) => a > b);
