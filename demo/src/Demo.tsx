import React, { FC, ReactNode } from 'react';

const Demo: FC<{ title: string; children: ReactNode }> = ({
  title,
  children
}) => {
  return (
    <div className="demo">
      <hr />
      <h4>{title}</h4>
      {children}
    </div>
  );
};

export default Demo;
