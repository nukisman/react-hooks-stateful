import { AndState, OrState } from './core';
import { useDep2 } from './dep';

export type Maybe<T> = T | undefined;

export const useFromMaybe = <A>(
  maybe: OrState<Maybe<A>>,
  dflt: OrState<A>
): AndState<A> => useDep2(maybe, dflt, (maybe, dflt) => maybe || dflt);
