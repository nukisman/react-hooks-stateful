import React, { FC } from 'react';
import DemoAsync from './DemoAsync';
import DemoMouse from './DemoMouse';
import TestWriteReadOnly from './TestWriteReadOnly';
import DemoInputArray from './DemoInputArray';
import DemoNumber from './DemoNumber';
import DemoInput from './DemoInput';
import DemoString from './DemoString';
import DemoWindowSize from './DemoWindowSize';
import DemoArray from './DemoArray';
import DemoObjectProps from './DemoObjectProps';

const App: FC = () => (
  <>
    <h3>Demo: react-hooks-pure</h3>
    <TestWriteReadOnly />
    <DemoMouse />
    <DemoWindowSize />
    <DemoObjectProps />
    <DemoInput />
    <DemoNumber />
    <DemoString />
    <DemoInputArray />
    <DemoArray />
    <DemoAsync />
  </>
);

export default App;
