import { reuseReduce } from './array';
import { AndState, OrState } from './core';
import { useDeps } from './dep';

/** Concat strings */
export const useStringConcat = reuseReduce(
  '',
  (acc: string, s: string) => acc + s
);

/** Tagged template string for State<any> values.
 * Usage: useString`Name: ${nameState}, Age: ${ageState}`
 */
export const useString = (
  literals: TemplateStringsArray,
  ...placeholders: OrState<any>[]
): AndState<string> =>
  useDeps<any[], string>(placeholders, placeholders => {
    let result = '';
    // interleave the literals with the placeholders
    for (let i = 0; i < placeholders.length; i++) {
      result += literals[i];
      result += placeholders[i];
    }
    // add the last literal
    result += literals[literals.length - 1];
    return result;
  });
