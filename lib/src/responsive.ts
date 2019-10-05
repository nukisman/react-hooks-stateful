/** Created by Alexander Nuikin <nukisman@gmail.com> */
import React, { useEffect } from 'react';
import { constState, State, useDepState2, useInState } from './main';
import { useLte } from './operator';

export type Size = { width: number; height: number };
export const getSize = (): Size => ({
  width: window.innerWidth,
  height: window.innerHeight
});

export const useWindowSize: () => State<Size> = () => {
  const size = useInState(getSize);
  useEffect(() => {
    const listen = () => {
      size.set(getSize());
    };
    window.addEventListener('resize', listen);
    return () => window.removeEventListener('resize', listen);
  }, []);
  return new State(size.state);
};

export const useWindowWidth: () => State<number> = () =>
  constState(useWindowSize().state.width);

export const useWindowHeight: () => State<number> = () =>
  constState(useWindowSize().state.height);

export const useDepMobile: (
  threshold: State<number>
) => State<boolean> = threshold => useLte(useWindowWidth(), threshold);

export const useDepWidthLevels: (
  threshold: State<number[]>
) => State<boolean[]> = levels => {
  const width = useWindowWidth();
  return useDepState2<number, number[], boolean[]>(
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
