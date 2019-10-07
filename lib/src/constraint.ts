/*********************************************************
 * Constraint
 * *******************************************************/
// TODO: Replace with useConstraint<S, E = ConstraintError>(State<S>, State<Predicate<S>>):State<S | E>
//
// export class OutOfDomain<S> extends Error {
//   public state: S;
//   constructor(state: S) {
//     super(`State out of domain: ${state}`);
//     this.state = state;
//   }
// }
//
// // todo: better name instead of domain: MaybeInDomain
// export type Domain<S> = S | OutOfDomain<S>;
//
// export interface InStateInDomain<S> extends State<Domain<S>> {
//   set: (state: S) => void;
//   update: (upd: (prev: S) => S) => void;
//   predicate: Predicate<S>;
// }
//
// export const useInStateInDomain = <S>(
//   initialState: Initial<S>,
//   domain: State<Predicate<S>>
// ): InStateInDomain<S> => {
//   const input = useInState<S>(initialState);
//   const dep = useDepState2<S, Predicate<S>, S | OutOfDomain<S>>(
//     input,
//     domain,
//     (input, domain) => (domain(input) ? input : new OutOfDomain(input))
//   );
//   return {
//     state: dep.state,
//     set: input.set,
//     update: input.update,
//     predicate: domain.state
//   };
// };
//
// export interface InStateAllowed<S> extends InStateInDomain<S> {
//   allowed: S[];
// }
//
// export const useInStateAllowed = <S>(
//   initialState: S,
//   allowed: State<S[]>,
//   isEqual: (a: S, b: S) => boolean
// ): InStateAllowed<S> => {
//   const input = useInState<S>(initialState);
//   const dep = useDepState2<
//     S,
//     S[],
//     { predicate: Predicate<S>; either: Domain<S> }
//   >(input, allowed, (input, allowed) => {
//     const isAllowed: Predicate<S> = s =>
//       isEqual
//         ? allowed.findIndex(d => isEqual(s, d)) !== -1
//         : allowed.includes(s);
//     return {
//       predicate: isAllowed,
//       either: isAllowed(input) ? input : new OutOfDomain(input)
//     };
//   });
//   return {
//     state: dep.state.either,
//     set: input.set,
//     update: input.update,
//     allowed: allowed.state,
//     predicate: dep.state.predicate
//   };
// };
