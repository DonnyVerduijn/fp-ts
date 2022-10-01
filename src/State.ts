/**
 * @since 3.0.0
 */
import type * as applicative from './Applicative'
import * as apply from './Apply'
import * as flattenable from './Flattenable'
import type { Endomorphism } from './Endomorphism'
import type { FromState as FromState_ } from './FromState'
import { flow, identity, SK } from './f'
import * as functor from './Functor'
import type { TypeLambda } from './HKT'
import * as _ from './internal'
import type * as monad from './Monad'
import type * as pointed from './Pointed'
import type { ReadonlyNonEmptyArray } from './ReadonlyNonEmptyArray'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category model
 * @since 3.0.0
 */
export interface State<S, A> {
  (s: S): readonly [S, A]
}

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * Get the current state
 *
 * @category constructors
 * @since 3.0.0
 */
export const get =
  <S>(): State<S, S> =>
  (s) =>
    [s, s]

/**
 * Set the state
 *
 * @category constructors
 * @since 3.0.0
 */
export const put =
  <S>(s: S): State<S, void> =>
  () =>
    [s, undefined]

/**
 * Modify the state by applying a function to the current state
 *
 * @category constructors
 * @since 3.0.0
 */
export const modify =
  <S>(f: Endomorphism<S>): State<S, void> =>
  (s) =>
    [f(s), undefined]

/**
 * Get a value which depends on the current state
 *
 * @category constructors
 * @since 3.0.0
 */
export const gets =
  <S, A>(f: (s: S) => A): State<S, A> =>
  (s) =>
    [s, f(s)]

// -------------------------------------------------------------------------------------
// type class members
// -------------------------------------------------------------------------------------

/**
 * @category Functor
 * @since 3.0.0
 */
export const map =
  <A, B>(f: (a: A) => B) =>
  <S>(self: State<S, A>): State<S, B> =>
  (s1) => {
    const [s2, a] = self(s1)
    return [s2, f(a)]
  }

/**
 * @category sequencing
 * @since 3.0.0
 */
export const flatMap: <A, S, B>(f: (a: A) => State<S, B>) => (self: State<S, A>) => State<S, B> =
  (f) => (self) => (s1) => {
    const [s2, a] = self(s1)
    return f(a)(s2)
  }

/**
 * @category instances
 * @since 3.0.0
 */
export const Flattenable: flattenable.Flattenable<StateTypeLambda> = {
  map,
  flatMap
}

/**
 * Sequences the specified effect after this effect, but ignores the value
 * produced by the effect.
 *
 * @category sequencing
 * @since 3.0.0
 */
export const zipLeft: <S, _>(that: State<S, _>) => <A>(self: State<S, A>) => State<S, A> =
  /*#__PURE__*/ flattenable.zipLeft(Flattenable)

/**
 * A variant of `flatMap` that ignores the value produced by this effect.
 *
 * @category sequencing
 * @since 3.0.0
 */
export const zipRight: <S, A>(that: State<S, A>) => <_>(self: State<S, _>) => State<S, A> =
  /*#__PURE__*/ flattenable.zipRight(Flattenable)

/**
 * @since 3.0.0
 */
export const ap: <S, A>(fa: State<S, A>) => <B>(self: State<S, (a: A) => B>) => State<S, B> =
  /*#__PURE__*/ flattenable.ap(Flattenable)

/**
 * @category Pointed
 * @since 3.0.0
 */
export const of =
  <A, S>(a: A): State<S, A> =>
  (s) =>
    [s, a]

/**
 * @since 3.0.0
 */
export const unit = <S>(): State<S, void> => of(undefined)

/**
 * @category combinators
 * @since 3.0.0
 */
export const flatten: <S, A>(mma: State<S, State<S, A>>) => State<S, A> = /*#__PURE__*/ flatMap(identity)

// -------------------------------------------------------------------------------------
// type lambdas
// -------------------------------------------------------------------------------------

/**
 * @category type lambdas
 * @since 3.0.0
 */
export interface StateTypeLambda extends TypeLambda {
  readonly type: State<this['InOut1'], this['Out1']>
}

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

/**
 * @category instances
 * @since 3.0.0
 */
export const Functor: functor.Functor<StateTypeLambda> = {
  map
}

/**
 * @category mapping
 * @since 3.0.0
 */
export const flap: <A>(a: A) => <S, B>(fab: State<S, (a: A) => B>) => State<S, B> = /*#__PURE__*/ functor.flap(Functor)

/**
 * @category instances
 * @since 3.0.0
 */
export const Pointed: pointed.Pointed<StateTypeLambda> = {
  of
}

/**
 * @category instances
 * @since 3.0.0
 */
export const Apply: apply.Apply<StateTypeLambda> = {
  map,
  ap
}

/**
 * Lifts a binary function into `State`.
 *
 * @category lifting
 * @since 3.0.0
 */
export const lift2: <A, B, C>(f: (a: A, b: B) => C) => <S>(fa: State<S, A>, fb: State<S, B>) => State<S, C> =
  /*#__PURE__*/ apply.lift2(Apply)

/**
 * Lifts a ternary function into `State`.
 *
 * @category lifting
 * @since 3.0.0
 */
export const lift3: <A, B, C, D>(
  f: (a: A, b: B, c: C) => D
) => <S>(fa: State<S, A>, fb: State<S, B>, fc: State<S, C>) => State<S, D> = /*#__PURE__*/ apply.lift3(Apply)

/**
 * @category instances
 * @since 3.0.0
 */
export const Applicative: applicative.Applicative<StateTypeLambda> = {
  map,
  ap,
  of
}

/**
 * @category instances
 * @since 3.0.0
 */
export const Monad: monad.Monad<StateTypeLambda> = {
  map,
  of,
  flatMap
}

/**
 * @category instances
 * @since 3.0.0
 */
export const FromState: FromState_<StateTypeLambda> = {
  fromState: identity
}

// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------

/**
 * Run a computation in the `State` monad, discarding the final state.
 *
 * @since 3.0.0
 */
export const evaluate =
  <S>(s: S) =>
  <A>(ma: State<S, A>): A =>
    ma(s)[1]

/**
 * Run a computation in the `State` monad discarding the result.
 *
 * @since 3.0.0
 */
export const execute =
  <S>(s: S) =>
  <A>(self: State<S, A>): S =>
    self(s)[0]

// -------------------------------------------------------------------------------------
// do notation
// -------------------------------------------------------------------------------------

/**
 * @category do notation
 * @since 3.0.0
 */
export const bindTo: <N extends string>(name: N) => <S, A>(self: State<S, A>) => State<S, { readonly [K in N]: A }> =
  /*#__PURE__*/ functor.bindTo(Functor)

const let_: <N extends string, A extends object, B>(
  name: Exclude<N, keyof A>,
  f: (a: A) => B
) => <S>(self: State<S, A>) => State<S, { readonly [K in N | keyof A]: K extends keyof A ? A[K] : B }> =
  /*#__PURE__*/ functor.let(Functor)

export {
  /**
   * @category do notation
   * @since 3.0.0
   */
  let_ as let
}

/**
 * @category do notation
 * @since 3.0.0
 */
export const bind: <N extends string, A extends object, S, B>(
  name: Exclude<N, keyof A>,
  f: (a: A) => State<S, B>
) => (self: State<S, A>) => State<S, { readonly [K in N | keyof A]: K extends keyof A ? A[K] : B }> =
  /*#__PURE__*/ flattenable.bind(Flattenable)

/**
 * A variant of `bind` that sequentially ignores the scope.
 *
 * @category do notation
 * @since 3.0.0
 */
export const bindRight: <N extends string, A extends object, S, B>(
  name: Exclude<N, keyof A>,
  fb: State<S, B>
) => (self: State<S, A>) => State<S, { readonly [K in N | keyof A]: K extends keyof A ? A[K] : B }> =
  /*#__PURE__*/ apply.bindRight(Apply)

// -------------------------------------------------------------------------------------
// tuple sequencing
// -------------------------------------------------------------------------------------

/**
 * @category tuple sequencing
 * @since 3.0.0
 */
export const tupled: <S, A>(self: State<S, A>) => State<S, readonly [A]> = /*#__PURE__*/ functor.tupled(Functor)

/**
 * Sequentially zips this effect with the specified effect.
 *
 * @category tuple sequencing
 * @since 3.0.0
 */
export const zipFlatten: <S, B>(
  fb: State<S, B>
) => <A extends ReadonlyArray<unknown>>(self: State<S, A>) => State<S, readonly [...A, B]> =
  /*#__PURE__*/ apply.zipFlatten(Apply)

/**
 * Sequentially zips this effect with the specified effect using the specified combiner function.
 *
 * @category tuple sequencing
 * @since 3.0.0
 */
export const zipWith: <S, B, A, C>(that: State<S, B>, f: (a: A, b: B) => C) => (self: State<S, A>) => State<S, C> =
  /*#__PURE__*/ apply.zipWith(Apply)

// -------------------------------------------------------------------------------------
// array utils
// -------------------------------------------------------------------------------------

/**
 * Equivalent to `ReadonlyNonEmptyArray#traverseWithIndex(Apply)`.
 *
 * @since 3.0.0
 */
export const traverseReadonlyNonEmptyArrayWithIndex =
  <A, S, B>(f: (index: number, a: A) => State<S, B>) =>
  (as: ReadonlyNonEmptyArray<A>): State<S, ReadonlyNonEmptyArray<B>> => {
    return (s) => {
      const [s2, b] = f(0, _.head(as))(s)
      const bs: _.NonEmptyArray<B> = [b]
      let out = s2
      for (let i = 1; i < as.length; i++) {
        const [s2, b] = f(i, as[i])(out)
        bs.push(b)
        out = s2
      }
      return [out, bs]
    }
  }

/**
 * Equivalent to `ReadonlyArray#traverseWithIndex(Applicative)`.
 *
 * @since 3.0.0
 */
export const traverseReadonlyArrayWithIndex = <A, S, B>(f: (index: number, a: A) => State<S, B>) => {
  const g = traverseReadonlyNonEmptyArrayWithIndex(f)
  return (as: ReadonlyArray<A>): State<S, ReadonlyArray<B>> => {
    return _.isNonEmpty(as) ? g(as) : of(_.Zip)
  }
}

/**
 * Equivalent to `ReadonlyNonEmptyArray#traverse(Apply)`.
 *
 * @since 3.0.0
 */
export const traverseReadonlyNonEmptyArray = <A, S, B>(
  f: (a: A) => State<S, B>
): ((as: ReadonlyNonEmptyArray<A>) => State<S, ReadonlyNonEmptyArray<B>>) => {
  return traverseReadonlyNonEmptyArrayWithIndex(flow(SK, f))
}

/**
 * Equivalent to `ReadonlyArray#traverse(Applicative)`.
 *
 * @since 3.0.0
 */
export const traverseReadonlyArray = <A, S, B>(
  f: (a: A) => State<S, B>
): ((as: ReadonlyArray<A>) => State<S, ReadonlyArray<B>>) => {
  return traverseReadonlyArrayWithIndex(flow(SK, f))
}

/**
 * Equivalent to `ReadonlyArray#sequence(Applicative)`.
 *
 * @since 3.0.0
 */
export const sequenceReadonlyArray: <S, A>(arr: ReadonlyArray<State<S, A>>) => State<S, ReadonlyArray<A>> =
  /*#__PURE__*/ traverseReadonlyArray(identity)
