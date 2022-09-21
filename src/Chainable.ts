/**
 * @since 3.0.0
 */
import type { Apply } from './Apply'
import { pipe } from './function'
import type { Functor } from './Functor'
import type { HKT, Kind } from './HKT'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category type classes
 * @since 3.0.0
 */
export interface Chainable<M extends HKT> extends Functor<M> {
  readonly chain: <A, S, R2, W2, E2, B>(
    f: (a: A) => Kind<M, S, R2, W2, E2, B>
  ) => <R1, W1, E1>(ma: Kind<M, S, R1, W1, E1, A>) => Kind<M, S, R1 & R2, W1 | W2, E1 | E2, B>
}

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

/**
 * @category combinators
 * @since 3.0.0
 */
export const ap =
  <F extends HKT>(M: Chainable<F>): Apply<F>['ap'] =>
  (fa) =>
  (fab) =>
    pipe(
      fab,
      M.chain((f) => pipe(fa, M.map(f)))
    )

/**
 * @category combinators
 * @since 3.0.0
 */
export const chainFirst =
  <M extends HKT>(M: Chainable<M>) =>
  <A, S, R2, W2, E2, B>(
    f: (a: A) => Kind<M, S, R2, W2, E2, B>
  ): (<R1, W1, E1>(first: Kind<M, S, R1, W1, E1, A>) => Kind<M, S, R1 & R2, W1 | W2, E1 | E2, A>) =>
    M.chain((a) =>
      pipe(
        f(a),
        M.map(() => a)
      )
    )

// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------

/**
 * @since 3.0.0
 */
export const bind =
  <M extends HKT>(M: Chainable<M>) =>
  <N extends string, A, S, R2, W2, E2, B>(
    name: Exclude<N, keyof A>,
    f: (a: A) => Kind<M, S, R2, W2, E2, B>
  ): (<R1, W1, E1>(
    ma: Kind<M, S, R1, W1, E1, A>
  ) => Kind<M, S, R1 & R2, W1 | W2, E1 | E2, { readonly [K in keyof A | N]: K extends keyof A ? A[K] : B }>) =>
    M.chain((a) =>
      pipe(
        f(a),
        M.map((b) => Object.assign({}, a, { [name]: b }) as any)
      )
    )