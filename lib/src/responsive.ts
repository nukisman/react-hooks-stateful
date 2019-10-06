/** Created by Alexander Nuikin <nukisman@gmail.com> */
import React, { useEffect } from 'react';
import { constState, OrStateful, Stateful, useDep2, useInput } from './core';
import { useLte } from './operator';

export type Size = { width: number; height: number };
export const getSize = (): Size => ({
  width: window.innerWidth,
  height: window.innerHeight
});

export const useWindowSize: () => Stateful<Size> = () => {
  const size = useInput(getSize);
  useEffect(() => {
    const listen = () => {
      size.set(getSize());
    };
    window.addEventListener('resize', listen);
    return () => window.removeEventListener('resize', listen);
  }, []);
  return new Stateful(size.state);
};

export const useWindowWidth: () => Stateful<number> = () =>
  constState(useWindowSize().state.width);

export const useWindowHeight: () => Stateful<number> = () =>
  constState(useWindowSize().state.height);

export const useDepMobile: (
  threshold: OrStateful<number>
) => Stateful<boolean> = threshold => useLte(useWindowWidth(), threshold);

export const useDepWidthLevels: (
  threshold: OrStateful<number[]>
) => Stateful<boolean[]> = levels => {
  const width = useWindowWidth();
  return useDep2<number, number[], boolean[]>(
    width,
    levels,
    (width, levels) => {
      const flags = levels.map(
        (w, i) => (i > 0 ? levels[i - 1] < width : true) && width <= w
      );
      flags.push(levels[levels.length - 1] < width);
      return flags;
    }
  );
};
