import React, { ChangeEvent, FC } from 'react';
import Demo from './Demo';
import { useInput } from 'react-hooks-pure';

const DemoInput: FC = () => {
  const name = useInput('nukisman');
  const updateName = (e: ChangeEvent<HTMLInputElement>) =>
    name.set(e.target.value);
  return (
    <Demo title="Input">
      <input defaultValue={name.state} onChange={updateName} />
      <div>name.state: {name.state}</div>
    </Demo>
  );
};

export default DemoInput;
