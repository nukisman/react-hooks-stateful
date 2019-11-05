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

export const useWindowListener = (
  type: string,
  listener: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions
) => {
  useEffect(() => {
    window.addEventListener(type, listener);
    return () => window.removeEventListener(type, listener);
  }, []);
};

export const useStorageListener = (listener: (event: StorageEvent) => void) => {
  useWindowListener('storage', listener as EventListener);
};

export const useWindowSize: () => AndState<Size> = () => {
  const size = useInput(getSize);
  useWindowListener('resize', () => {
    size.set(getSize());
  });
  // TODO: Update window size on page zooming and device rotation
  // useWindowListener('wheel', () => {
  //   const s = getSize();
  //   console.log(`window ${s.width} x ${s.height}`);
  //   size.set(s);
  // });
  // useWindowListener('orientationchange', e => {
  //   console.log(window.screen.orientation);
  //   console.log(`screen ${window.screen.width} x ${window.screen.height}`);
  //   const s = getSize();
  //   console.log(`window ${s.width} x ${s.height}`);
  //   size.set(window.screen);
  // });
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
  useWindowListener(et, ((event: MouseEvent) => {
    input.set(event);
  }) as EventListener);
  return andStateRO(input);
};
