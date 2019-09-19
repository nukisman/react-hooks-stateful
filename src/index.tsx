/**
 * @function ExampleComponent
 */

import React, { FC, useState } from 'react';

// TODO: import .css with tslint
import styles from './styles.css';

export type Props = { text: string };

const ExampleComponent: FC<Props> = ({ text }) => {
  const [s] = useState(1);
  // const f = () => {
  //   const [x] = useState(1);
  // };
  // return <div className="test">Example Component 7: {text}</div>;
  return <div className={styles.test}>Example Component 6: {text}</div>;
};

export default ExampleComponent;
