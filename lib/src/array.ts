import {
  AndStateful,
  getState,
  Input,
  Maybe,
  OrStateful,
  Predicate,
  useDep2,
  useDep3
} from './core';

/** Concat arrays using array spread operator */
// TODO: varargs
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
// TODO: varargs items
export const usePush = function<A>(
  arr: OrStateful<A[]>,
  item: OrStateful<A>
): AndStateful<A[]> {
  return useDep2<A[], A, A[]>(arr, item, (arr: A[], item: A) => [...arr, item]);
};

/** Unshift item to array using array spread operator */
// TODO: varargs items
export const useUnshift = function<A>(
  arr: OrStateful<A[]>,
  item: OrStateful<A>
): AndStateful<A[]> {
  return useDep2<A[], A, A[]>(arr, item, (arr: A[], item: A) => [item, ...arr]);
};

type OrArray<S> = OrStateful<OrStateful<S>[]>;
// TODO: reuseReduceObj
export const reuseReduce = <A, R>(
  initial: OrStateful<R>,
  reduce: OrStateful<(acc: R, arg: A, index: number) => R>
) => (...args: OrStateful<A>[]): AndStateful<R> =>
  useReduce(args, initial, reduce);

export const useReduce = <A, R>(
  array: OrArray<A>,
  initial: OrStateful<R>,
  reduce: OrStateful<(acc: R, arg: A, index: number) => R>
): AndStateful<R> =>
  useDep3(array, initial, reduce, (array, initial, reduce) =>
    array.map(getState).reduce(reduce, initial)
  );

// TODO: reuseMapObj
export const reuseMap = <A, B>(
  map: OrStateful<(arg: A, index: number) => B>
) => (array: OrArray<A>): AndStateful<B[]> => useMap(array, map);

export const useMap = <A, B>(
  array: OrArray<A>,
  map: OrStateful<(arg: A, index: number) => B>
): AndStateful<B[]> =>
  useDep2(array, map, (array, map) => array.map(getState).map(map));

// TODO: reuseFilterObj
export const reuseFilter = <S>(
  filter: OrStateful<(arg: S, index: number, array: S[]) => boolean>
) => (array: OrArray<S>): AndStateful<S[]> => useFilter(array, filter);

export const useFilter = <S>(
  array: OrArray<S>,
  filter: OrStateful<(arg: S, index: number, array: S[]) => boolean>
): AndStateful<S[]> =>
  useDep2(array, filter, (array, filter) => array.map(getState).filter(filter));

// type AndStatefulMaybe<S> =
// todo: Iterable instead of Array?
export const useFind = <S>(
  array: OrArray<S>,
  predicate: OrStateful<Predicate<S>>
): AndStateful<Maybe<S>> =>
  useDep2(array, predicate, (args, predicate) =>
    args.map(getState).find(predicate)
  );
// useMethod(array, getState(array).find, predicate);
export const useJoin = <S>(
  array: OrArray<S>,
  separator: OrStateful<string>
): AndStateful<string> =>
  useDep2(array, separator, (args, separator) =>
    args.map(getState).join(separator)
  );

// todo: Other array functions

/**
 * Input Array - Stateful with mutable array state
 * Hook: useInputArray.
 */
export class InputArray<S> extends Input<S[]> {
  map(map: (item: S, index: number) => S) {
    this.updateState(array => array.map(map));
  }
  filter(filter: (item: S, index: number) => boolean) {
    this.updateState(array => array.filter(filter));
  }
}

export const useInputArray = <S>(array: OrStateful<S>[]): InputArray<S> =>
  new InputArray<S>(array.map(getState));
