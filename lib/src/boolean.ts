import { reuseDep, reuseDep2 } from './dep';

export const useNot = reuseDep(a => !a);

export const useAnd = reuseDep2((a, b) => a && b);

export const useOr = reuseDep2((a, b) => a || b);

export const useXor = reuseDep2((a, b) => (a && !b) || (!a && b));
