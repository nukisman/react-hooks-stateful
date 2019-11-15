/* Created by Alexander Nuikin (nukisman@gmail.com). */
// TODO: package: utilities: debug, random, promise, strings, arrays, functions, types
export type Int = number;
export type Lazy<T> = () => T;

export const identity: <T>(x: T) => T = x => x;

export const promise = <T>(fun: () => T): Promise<T> =>
  Promise.resolve().then(fun);

export const delay = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms));

export const fapp: <A, R>(f: ((arg: A) => R) | R, arg: A) => R = (f, arg) =>
  f instanceof Function ? f(arg) : f;

export const intercalate: <T>(
  array: T[],
  separator: (index: number) => T
) => T[] = (array, separator) =>
  array
    .slice(1)
    .reduce((acc, item, i) => [...acc, separator(i), item], [array[0]]);

export const log = (...args: any[]) => console.log(...args);

export const spy = <T>(label: string, x: T): T => {
  console.log(label, x);
  return x;
};

export const array = <T>(n: number, create: (n: number) => T) =>
  new Array<any>(n).fill(0).map((_, i) => create(i));

export const randomInt = (max: number): number =>
  parseInt((max * Math.random()).toFixed(0), 10);

// export const rMaybe: <T>(
//   renderT: (x: T) => JSX.Element | string
// ) => (x: Maybe<T>) => JSX.Element | string = renderT => x =>
//   x === undefined ? 'undefined' : renderT(x);

export const rBool = (x: boolean) => (x ? 'true' : 'false');
