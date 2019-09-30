/** Created by Alexander Nuikin <nukisman@gmail.com> */
import React, { useEffect } from 'react';
import { State, useDepState2, useInState, useLte } from './main';

type Size = { width: number; height: number };
const getSize = (): Size => ({
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
  return { state: size.state };
};

// todo: useWindowWidth = () => useProp('width', useWindowSize())
export const useWindowWidth: () => State<number> = () => ({
  state: useWindowSize().state.width
});

// todo: useWindowHeight = () => useProp('height', useWindowSize())
export const useWindowHeight: () => State<number> = () => ({
  state: useWindowSize().state.height
});

// ResponsivePropTypes.depMobile = DepPropTypes.depState(
//   PropTypes.bool.isRequired
// );
export const useDepMobile: (
  threshold: State<number>
) => State<boolean> = threshold => useLte(useWindowWidth(), threshold);

// ResponsivePropTypes.depWidthLevels = DepPropTypes.depState(
//   PropTypes.arrayOf(PropTypes.bool.isRequired).isRequired
// );
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
