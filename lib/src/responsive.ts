/** Created by Alexander Nuikin <nukisman@gmail.com> */
import { useEffect } from 'react';
import { useDep2 } from './dep';
import { andState, AndState, OrState, useInput } from './core';
import { useLte } from './number';

// TODO: useMouse

export type Size = { width: number; height: number };
export const getSize = (): Size => ({
  width: window.innerWidth,
  height: window.innerHeight
});

export const useWindowSize: () => AndState<Size> = () => {
  const size = useInput(getSize);
  useEffect(() => {
    const listen = () => {
      size.set(getSize());
    };
    window.addEventListener('resize', listen);
    return () => window.removeEventListener('resize', listen);
  }, []);
  return andState(size);
};

export const useDepMobile: (
  threshold: OrState<number>
) => AndState<boolean> = threshold => useLte(useWindowSize().width, threshold);

export const useDepWidthLevels: (
  threshold: OrState<number[]>
) => AndState<boolean[]> = levels => {
  const width = useWindowSize().width;
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
