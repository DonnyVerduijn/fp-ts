/**
 * `SemigroupK` has a very similar structure to `Semigroup`, the difference is that `SemigroupK` operates on type
 * constructors of one argument. So, for example, whereas you can find a `Semigroup` for types which are fully
 * specified like `number` or `ReadonlyArray<number>` or `Option<number>`, you will find `SemigroupK` for type constructors like `ReadonlyArray` and `Option`.
 * These types are type constructors in that you can think of them as "functions" in the type space.
 * You can think of the `ReadonlyArray` type as a function which takes a concrete type, like `number`, and returns a concrete type: `ReadonlyArray<number>`.
 * This pattern would also be referred to having `kind: * -> *`, whereas `number` would have kind `*` and `ReadonlyMap` would have `kind *,* -> *`,
 * and, in fact, the `K` in `SemigroupK` stands for `Kind`.
 *
 * `SemigroupK` instances are required to satisfy the following laws:
 *
 * 1. Associativity: `fa1 |> combineKind(() => fa2) |> combineKind(() => fa3) <-> fa1 |> combineKind(() => fa2 |> combineKind(() => fa3))`
 * 2. Distributivity: `fa1 |> combineKind(() => fa2) |> map(ab) <-> fa1 |> map(ab) |> combineKind(() => fa2 |> map(ab))`
 *
 * @since 3.0.0
 */
import type { TypeLambda, Kind, TypeClass } from './HKT'

/**
 * @category model
 * @since 3.0.0
 */
export interface SemigroupKind<F extends TypeLambda> extends TypeClass<F> {
  readonly combineKind: <S, R2, O2, E2, B>(
    that: Kind<F, S, R2, O2, E2, B>
  ) => <R1, O1, E1, A>(self: Kind<F, S, R1, O1, E1, A>) => Kind<F, S, R1 & R2, O1 | O2, E1 | E2, A | B>
}

/**
 * @since 3.0.0
 */
export const combineKindAll =
  <F extends TypeLambda>(F: SemigroupKind<F>) =>
  <S, R, O, E, A>(startWith: Kind<F, S, R, O, E, A>) =>
  (as: ReadonlyArray<Kind<F, S, R, O, E, A>>): Kind<F, S, R, O, E, A> =>
    as.reduce((acc, a) => F.combineKind(a)(acc), startWith)