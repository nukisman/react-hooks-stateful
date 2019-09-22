/** Created by Alexander Nuikin <nukisman@gmail.com> */
import React, { useEffect } from 'react';
import { State, useDepState2, useInState, useLte } from './main';

// export const ResponsivePropTypes = {};
//
// ResponsivePropTypes.depWidth = StatePropTypes.depState(
//   PropTypes.number.isRequired
// );
export const useDepWidth: () => State<number> = () => {
  const width = useInState(window.innerWidth);
  useEffect(() => {
    const listen = () => {
      width.set(window.innerWidth);
    };
    window.addEventListener('resize', listen);
    return () => window.removeEventListener('resize', listen);
  }, []);
  return { state: width.state };
};

// ResponsivePropTypes.depMobile = DepPropTypes.depState(
//   PropTypes.bool.isRequired
// );
export const useDepMobile: (
  threshold: State<number>
) => State<boolean> = threshold => useLte(useDepWidth(), threshold);

// ResponsivePropTypes.depWidthLevels = DepPropTypes.depState(
//   PropTypes.arrayOf(PropTypes.bool.isRequired).isRequired
// );
export const useDepWidthLevels: (
  threshold: State<number[]>
) => State<boolean[]> = levels => {
  const width = useDepWidth();
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
