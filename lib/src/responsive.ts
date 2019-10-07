/** Created by Alexander Nuikin <nukisman@gmail.com> */
import { useEffect } from 'react';
import { useDep2 } from './dep';
import { AndState, andStateRO, getState, OrState, useInput } from './core';
import { useLte } from './number';
import { Maybe } from './maybe';

export type Size = { width: number; height: number };
export const getSize = (): Size => ({
  width: window.innerWidth,
  height: window.innerHeight
});

export const useWindowSize: () => AndState<Size> = () => {
  const et = 'resize';
  const size = useInput(getSize);
  useEffect(() => {
    const listen = () => {
      size.set(getSize());
    };
    window.addEventListener(et, listen);
    return () => window.removeEventListener(et, listen);
  }, []);
  return andStateRO(size);
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

export enum MouseEventType {
  Click = 'click',
  DblClick = 'dblclick',
  ContextMenu = 'contextmenu',
  MouseMove = 'mousemove',
  MouseUp = 'mouseup',
  MouseDown = 'mousedown',
  MouseEnter = 'mouseenter',
  MouseLeave = 'mouseleave',
  MouseOut = 'mouseout',
  MouseOver = 'mouseover'
}

export const useMouse = (
  eventType: OrState<MouseEventType>
): AndState<Maybe<MouseEvent>> => {
  const et = getState(eventType);
  const input = useInput<Maybe<MouseEvent>>(undefined);
  useEffect(() => {
    const listen = (event: MouseEvent) => {
      input.set(event);
    };
    window.addEventListener(et, listen);
    return () => window.removeEventListener(et, listen);
  }, []);
  return andStateRO(input);
};
