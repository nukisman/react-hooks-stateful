// @ts-ignore
import stringify from 'stringify-object';
import { useDebugValue } from 'react';

export const useDebug = (value: any): void => {
  useDebugValue(
    stringify(value, {
      indent: ' ',
      inlineCharacterLimit: 500,
      transform: (obj: any, prop: string, str: string) => {
        if (str.startsWith('function ')) {
          return 'f';
        } else return str;
      }
    })
  );
};

// todo?: useDebugEffect
