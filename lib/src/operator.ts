import {
  State,
  useDepState2,
  useDepStates,
  reuseReduce,
  reuse,
  reuse2
} from './core';

/*********************************************************
 * JS Operators hooks
 * *******************************************************/

export const useEq = (
  a: State<any>,
  b: State<any>,
  ...rest: State<any>[]
): State<boolean> =>
  reuseReduce(a === b, (acc: boolean, value: any) => acc && a === value)(
    ...rest
  );

export const useAnd = reuse2((a, b) => a && b);

export const useOr = reuse2((a, b) => a || b);

export const useXor = reuse2((a, b) => (a && !b) || (!a && b));

// todo: Bitwise operators

/** JS Operators hooks: object property */
export const reuseProp = <K extends string>(name: State<K>) => <
  S,
  T extends { [P in K]: S } = { [P in K]: S }
>(
  obj: State<T>
): State<S> =>
  useDepState2<K, T, T[K]>(name, obj, (name: K, obj: T) => obj[name]);

export const reusePropOf = <K extends string>(name: State<K>) => <S>() => <
  T extends { [P in K]: S } = { [P in K]: S }
>(
  obj: State<T>
): State<S> => reuseProp<K>(name)<S, T>(obj);

export const useProp = <
  K extends string,
  S,
  T extends { [P in K]: S } = { [P in K]: S }
>(
  name: State<K>,
  obj: State<T>
): State<S> =>
  useDepState2<K, T, T[K]>(name, obj, (name: K, obj: T) => obj[name]);

/** Spread objects */
export const useExtend = function<A, B>(
  objA: State<A>,
  objB: State<B>
): State<A & B> {
  return useDepState2<A, B, A & B>(objA, objB, (objA: A, objB: B) => ({
    ...objA,
    ...objB
  }));
};

/** Concat arrays using array spread operator */
export const useConcat = function<A>(
  arr1: State<A[]>,
  arr2: State<A[]>
): State<A[]> {
  return useDepState2<A[], A[], A[]>(arr1, arr2, (arr1: A[], arr2: A[]) => [
    ...arr1,
    ...arr2
  ]);
};

/** Push item to array using array spread operator */
export const usePush = function<A>(
  arr: State<A[]>,
  item: State<A>
): State<A[]> {
  return useDepState2<A[], A, A[]>(arr, item, (arr: A[], item: A) => [
    ...arr,
    item
  ]);
};

/** Unshift item to array using array spread operator */
export const useUnshift = function<A>(
  arr: State<A[]>,
  item: State<A>
): State<A[]> {
  return useDepState2<A[], A, A[]>(arr, item, (arr: A[], item: A) => [
    item,
    ...arr
  ]);
};

/** Concat strings */
export const useConcatString = reuseReduce('', (acc, s: string) => acc + s);

/** Tagged template string for State<any> values.
 * Usage: useString`Name: ${nameState}, Age: ${ageState}`
 */
export const useString = (
  literals: TemplateStringsArray,
  ...placeholders: State<any>[]
): State<string> =>
  useDepStates<any[], string>(placeholders, placeholders => {
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
export const useNot = reuse(a => !a);

/** Negate number value */
export const useNeg = reuse((a: number) => -a);

/** a + b + ... */
export const useSum = reuseReduce(0, (acc, n: number) => acc + n);

/** a - b */
// todo: a - b - ...
export const useSub = reuse2((a: number, b: number) => a - b);

/** a * b * ... */
export const useProd = reuseReduce(1, (acc, n: number) => acc * n);

/** a / b */
// todo: a / b / ...
export const useDiv = reuse2((a: number, b: number) => a / b);

/** a <= b */
export const useLte = reuse2((a: number, b: number) => a <= b);

/** a < b */
export const useLt = reuse2((a: number, b: number) => a < b);

/** a >= b */
export const useGte = reuse2((a: number, b: number) => a >= b);

/** a > b */
export const useGt = reuse2((a: number, b: number) => a > b);
