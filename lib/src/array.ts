import { AndState, getState, Input, OrState, Predicate } from './core';
import { Maybe } from './maybe';
import { useDep2, useDep3 } from './dep';

/** Concat arrays using array spread operator */
export const useConcat = <A>(
  ...args: OrState<OrState<A[] | A>>[]
): AndState<A[]> =>
  useReduce<A[] | A, A[]>(args.map(getState), [], (acc, arg) => [
    ...acc,
    ...(Array.isArray(arg) ? arg : [arg])
  ]);

type OrArray<S> = OrState<OrState<S>[]>;
// TODO: reuseReduceObj
export const reuseReduce = <A, R>(
  initial: OrState<R>,
  reduce: OrState<(acc: R, arg: A, index: number) => R>
) => (...args: OrState<A>[]): AndState<R> => useReduce(args, initial, reduce);

export const useReduce = <A, R>(
  array: OrArray<A>,
  initial: OrState<R>,
  reduce: OrState<(acc: R, arg: A, index: number) => R>
): AndState<R> =>
  useDep3(array, initial, reduce, (array, initial, reduce) =>
    array.map(getState).reduce(reduce, initial)
  );

// TODO: reuseMapObj
export const reuseMap = <A, B>(map: OrState<(arg: A, index: number) => B>) => (
  array: OrArray<A>
): AndState<B[]> => useMap(array, map);

export const useMap = <A, B>(
  array: OrArray<A>,
  map: OrState<(arg: A, index: number) => B>
): AndState<B[]> =>
  useDep2(array, map, (array, map) =>
    // TODO: TypeScript bug issue: type infer for array (in case of 2-args generic only?)
    array.map(getState).map(map)
  );

// TODO: reuseFilterObj
export const reuseFilter = <S>(
  filter: OrState<(arg: S, index: number, array: S[]) => boolean>
) => (array: OrArray<S>): AndState<S[]> => useFilter(array, filter);

export const useFilter = <S>(
  array: OrArray<S>,
  filter: OrState<(arg: S, index: number, array: S[]) => boolean>
): AndState<S[]> =>
  useDep2(array, filter, (array, filter) => array.map(getState).filter(filter));

// type AndStatefulMaybe<S> =
// todo: Iterable instead of Array?
export const useFind = <S>(
  array: OrArray<S>,
  predicate: OrState<Predicate<S>>
): AndState<Maybe<S>> =>
  useDep2(array, predicate, (args, predicate) =>
    args.map(getState).find(predicate)
  );
// useMethod(array, getState(array).find, predicate);
export const useJoin = <S>(
  array: OrArray<S>,
  separator: OrState<string>
): AndState<string> =>
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

export const useInputArray = <S>(array: OrState<S>[]): InputArray<S> =>
  new InputArray<S>(array.map(getState));
