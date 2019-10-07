import React, { FC } from 'react';
import Demo from './Demo';
import {
  Pure,
  useMouse,
  AndState,
  OrState,
  MouseEventType,
  useDep
} from 'react-hooks-pure';

type Coord = { x: number; y: number };

const useCoord = (event: OrState<MouseEvent>): AndState<Coord> =>
  useDep(event, event => ({
    x: event ? event.clientX : -1,
    y: event ? event.clientY : -1
  }));

const useShowCoord = (coord: OrState<Coord>): Pure<string> =>
  useDep(coord, c => `(${c.x}, ${c.y})`);

export const useMouseCoord = (): Pure<Coord> =>
  useCoord(useMouse(MouseEventType.MouseMove));

const DemoMouse: FC = () => {
  const click = useShowCoord(useCoord(useMouse(MouseEventType.Click)));
  const move = useShowCoord(useCoord(useMouse(MouseEventType.MouseMove)));
  return (
    <Demo title="Mouse">
      Click: {click.state}
      <br />
      Move: {move.state}
    </Demo>
  );
};

export default DemoMouse;
