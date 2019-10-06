/** Created by Alexander Nuikin <nukisman@gmail.com> */
import React, { useEffect } from 'react';
import { OrStateful, Stateful, useDep2, useInput } from './core';
import { useLte } from './operator';

export type Size = { width: number; height: number };
export const getSize = (): Size => ({
  width: window.innerWidth,
  height: window.innerHeight
});

// TODO: Auto proxy state.* props
export class StatefulSize extends Stateful<Size> {
  get width() {
    return this.state.width;
  }
  get height() {
    return this.state.height;
  }
}

export const useWindowSize: () => StatefulSize = () => {
  const size = useInput(getSize);
  useEffect(() => {
    const listen = () => {
      size.set(getSize());
    };
    window.addEventListener('resize', listen);
    return () => window.removeEventListener('resize', listen);
  }, []);
  return new StatefulSize(size.state);
};

export const useDepMobile: (
  threshold: OrStateful<number>
) => Stateful<boolean> = threshold => useLte(useWindowSize().width, threshold);

export const useDepWidthLevels: (
  threshold: OrStateful<number[]>
) => Stateful<boolean[]> = levels => {
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
