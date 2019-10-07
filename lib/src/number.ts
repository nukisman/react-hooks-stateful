import { reuseDep, reuseDep2 } from './dep';
import { reuseReduce } from './array';

// todo: Bitwise operators

/** Negate number value */
export const useNeg = reuseDep((a: number) => -a);

/** a + b + ... */
export const useSum = reuseReduce(0, (acc, n: number) => acc + n);

/** a - b */
// todo: Varargs: a - b - ...
export const useSub = reuseDep2((a: number, b: number) => a - b);

/** a * b * ... */
export const useProd = reuseReduce(1, (acc, n: number) => acc * n);

/** a / b */
// todo: Varargs: a / b / ...
export const useDiv = reuseDep2((a: number, b: number) => a / b);

/** a <= b */
export const useLte = reuseDep2((a: number, b: number) => a <= b);

/** a < b */
export const useLt = reuseDep2((a: number, b: number) => a < b);

/** a >= b */
export const useGte = reuseDep2((a: number, b: number) => a >= b);

/** a > b */
export const useGt = reuseDep2((a: number, b: number) => a > b);
