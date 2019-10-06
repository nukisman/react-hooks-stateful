import {
  useDep2,
  useDeps,
  reuseReduce,
  reuseDep,
  reuseDep2,
  OrStateful,
  AndStateful
} from './core';

/*********************************************************
 * JS Operators hooks
 * *******************************************************/

export const useEq = (
  a: OrStateful<any>,
  b: OrStateful<any>,
  ...rest: OrStateful<any>[]
): AndStateful<boolean> =>
  reuseReduce(a === b, (acc: boolean, value: any) => acc && a === value)(
    ...rest
  );

export const useAnd = reuseDep2((a, b) => a && b);

export const useOr = reuseDep2((a, b) => a || b);

export const useXor = reuseDep2((a, b) => (a && !b) || (!a && b));

// todo: Bitwise operators

/** JS Operators hooks: object property */
export const reuseProp = <K extends string>(name: OrStateful<K>) => <
  S,
  T extends { [P in K]: S } = { [P in K]: S }
>(
  obj: OrStateful<T>
): AndStateful<S> =>
  useDep2<K, T, T[K]>(name, obj, (name: K, obj: T) => obj[name]);

export const reusePropOf = <K extends string>(name: OrStateful<K>) => <S>() => <
  T extends { [P in K]: S } = { [P in K]: S }
>(
  obj: OrStateful<T>
): AndStateful<S> => reuseProp<K>(name)<S, T>(obj);

export const useProp = <
  K extends string,
  S,
  T extends { [P in K]: S } = { [P in K]: S }
>(
  name: OrStateful<K>,
  obj: OrStateful<T>
): AndStateful<S> =>
  useDep2<K, T, T[K]>(name, obj, (name: K, obj: T) => obj[name]);

/** Spread objects */
export const useExtend = function<A, B>(
  objA: OrStateful<A>,
  objB: OrStateful<B>
): AndStateful<A & B> {
  return useDep2<A, B, A & B>(objA, objB, (objA: A, objB: B) => ({
    ...objA,
    ...objB
  }));
};

/** Concat arrays using array spread operator */
export const useConcat = function<A>(
  arr1: OrStateful<A[]>,
  arr2: OrStateful<A[]>
): AndStateful<A[]> {
  return useDep2<A[], A[], A[]>(arr1, arr2, (arr1: A[], arr2: A[]) => [
    ...arr1,
    ...arr2
  ]);
};

/** Push item to array using array spread operator */
export const usePush = function<A>(
  arr: OrStateful<A[]>,
  item: OrStateful<A>
): AndStateful<A[]> {
  return useDep2<A[], A, A[]>(arr, item, (arr: A[], item: A) => [...arr, item]);
};

/** Unshift item to array using array spread operator */
export const useUnshift = function<A>(
  arr: OrStateful<A[]>,
  item: OrStateful<A>
): AndStateful<A[]> {
  return useDep2<A[], A, A[]>(arr, item, (arr: A[], item: A) => [item, ...arr]);
};

/** Concat strings */
export const useConcatString = reuseReduce('', (acc, s: string) => acc + s);

/** Tagged template string for State<any> values.
 * Usage: useString`Name: ${nameState}, Age: ${ageState}`
 */
export const useString = (
  literals: TemplateStringsArray,
  ...placeholders: OrStateful<any>[]
): AndStateful<string> =>
  useDeps<any[], string>(placeholders, placeholders => {
    let result = '';

    // interleave the literals with the placeholders
    for (let i = 0; i < placeholders.length; i++) {
      result += literals[i];
      result += placeholders[i];
    }

    // add the last literal
    result += literals[literals.length - 1];
    return result;
  });

/** Invert boolean value */
export const useNot = reuseDep(a => !a);

/** Negate number value */
export const useNeg = reuseDep((a: number) => -a);

/** a + b + ... */
export const useSum = reuseReduce(0, (acc, n: number) => acc + n);

/** a - b */
// todo: a - b - ...
export const useSub = reuseDep2((a: number, b: number) => a - b);

/** a * b * ... */
export const useProd = reuseReduce(1, (acc, n: number) => acc * n);

/** a / b */
// todo: a / b / ...
export const useDiv = reuseDep2((a: number, b: number) => a / b);

/** a <= b */
export const useLte = reuseDep2((a: number, b: number) => a <= b);

/** a < b */
export const useLt = reuseDep2((a: number, b: number) => a < b);

/** a >= b */
export const useGte = reuseDep2((a: number, b: number) => a >= b);

/** a > b */
export const useGt = reuseDep2((a: number, b: number) => a > b);
