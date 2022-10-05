/**
 * `IOOption<A>` represents a synchronous computation that either yields a value of type `A` or nothing.
 *
 * If you want to represent a synchronous computation that never fails, please see `IO`.
 * If you want to represent a synchronous computation that may fail, please see `IOEither`.
 *
 * @since 3.0.0
 */
import type * as semigroupKind from './SemigroupKind'
import * as monoidKind from './MonoidKind'
import type * as applicative from './Applicative'
import * as apply from './Apply'
import type * as categoryKind from './CategoryKind'
import type * as composableKind from './ComposableKind'
import * as flattenable from './Flattenable'
import * as compactable from './Compactable'
import type { Either } from './Either'
import * as filterable from './Filterable'
import * as fromOption_ from './FromOption'
import * as fromEither_ from './FromEither'
import * as fromIO_ from './FromIO'
import type { LazyArg } from './Function'
import { flow, identity, SK } from './Function'
import * as functor from './Functor'
import type { TypeLambda } from './HKT'
import * as _ from './internal'
import * as io from './IO'
import type { IOEither } from './IOEither'
import type * as monad from './Monad'
import * as option from './Option'
import * as optionT from './OptionT'
import * as fromIdentity from './FromIdentity'
import type { Predicate } from './Predicate'
import type { ReadonlyNonEmptyArray } from './ReadonlyNonEmptyArray'
import type { Refinement } from './Refinement'
import type { IO } from './IO'
import type { Option } from './Option'

/**
 * @category model
 * @since 3.0.0
 */
export interface IOOption<A> extends IO<Option<A>> {}

// -------------------------------------------------------------------------------------
// type lambdas
// -------------------------------------------------------------------------------------

/**
 * @category type lambdas
 * @since 3.0.0
 */
export interface IOOptionTypeLambda extends TypeLambda {
  readonly type: IOOption<this['Out1']>
}

/**
 * @since 3.0.0
 */
export const emptyKind: <A>() => IOOption<A> = /*#__PURE__*/ optionT.emptyKind(io.FromIdentity)

/**
 * @category constructors
 * @since 3.0.0
 */
export const none: IOOption<never> = /*#__PURE__*/ emptyKind()

/**
 * @category constructors
 * @since 3.0.0
 */
export const some: <A>(a: A) => IOOption<A> = /*#__PURE__*/ optionT.some(io.FromIdentity)

/**
 * @category conversions
 * @since 3.0.0
 */
export const fromOption: <A>(fa: Option<A>) => IOOption<A> = io.of

/**
 * @category conversions
 * @since 3.0.0
 */
export const fromEither: <A>(e: Either<unknown, A>) => IO<option.Option<A>> = /*#__PURE__*/ optionT.fromEither(
  io.FromIdentity
)

/**
 * @category conversions
 * @since 3.0.0
 */
export const fromIO: <A>(ma: IO<A>) => IOOption<A> = /*#__PURE__*/ optionT.fromKind(io.Functor)

/**
 * @category conversions
 * @since 3.0.0
 */
export const fromIOEither: <A>(ma: IOEither<unknown, A>) => IOOption<A> = /*#__PURE__*/ io.map(option.fromEither)

// -------------------------------------------------------------------------------------
// pattern matching
// -------------------------------------------------------------------------------------

/**
 * @category pattern matching
 * @since 3.0.0
 */
export const match: <B, A, C = B>(onNone: LazyArg<B>, onSome: (a: A) => C) => (ma: IOOption<A>) => IO<B | C> =
  /*#__PURE__*/ optionT.match(io.Functor)

/**
 * @category pattern matching
 * @since 3.0.0
 */
export const matchIO: <B, A, C = B>(onNone: LazyArg<IO<B>>, onSome: (a: A) => IO<C>) => (ma: IOOption<A>) => IO<B | C> =
  /*#__PURE__*/ optionT.matchKind(io.Flattenable)

/**
 * @category error handling
 * @since 3.0.0
 */
export const getOrElse: <B>(onNone: B) => <A>(self: IOOption<A>) => IO<A | B> = /*#__PURE__*/ optionT.getOrElse(
  io.Functor
)

/**
 * @category error handling
 * @since 3.0.0
 */
export const getOrElseIO: <B>(onNone: IO<B>) => <A>(self: IOOption<A>) => IO<A | B> =
  /*#__PURE__*/ optionT.getOrElseKind(io.Monad)

/**
 * @category conversions
 * @since 3.0.0
 */
export const toUndefined: <A>(self: IOOption<A>) => IO<A | undefined> = io.map(option.toUndefined)

/**
 * @category conversions
 * @since 3.0.0
 */
export const toNull: <A>(self: IOOption<A>) => IO<A | null> = io.map(option.toNull)

// -------------------------------------------------------------------------------------
// type class members
// -------------------------------------------------------------------------------------

/**
 * Returns an effect whose success is mapped by the specified `f` function.
 *
 * @category mapping
 * @since 3.0.0
 */
export const map: <A, B>(f: (a: A) => B) => (fa: IOOption<A>) => IOOption<B> = /*#__PURE__*/ optionT.map(io.Functor)

/**
 * @category constructors
 * @since 3.0.0
 */
export const of: <A>(a: A) => IOOption<A> = some

/**
 * @category instances
 * @since 3.0.0
 */
export const FromIdentity: fromIdentity.FromIdentity<IOOptionTypeLambda> = {
  of
}

/**
 * @category sequencing
 * @since 3.0.0
 */
export const flatMap: <A, B>(f: (a: A) => IOOption<B>) => (self: IOOption<A>) => IOOption<B> =
  /*#__PURE__*/ optionT.flatMap(io.Monad)

/**
 * @category instances
 * @since 3.0.0
 */
export const Flattenable: flattenable.Flattenable<IOOptionTypeLambda> = {
  map,
  flatMap
}

/**
 * @since 3.0.0
 */
export const composeKind: <B, C>(
  bfc: (b: B) => IOOption<C>
) => <A>(afb: (a: A) => IOOption<B>) => (a: A) => IOOption<C> = /*#__PURE__*/ flattenable.composeKind(Flattenable)

/**
 * @category instances
 * @since 3.0.0
 */
export const ComposableKind: composableKind.ComposableKind<IOOptionTypeLambda> = {
  composeKind
}

/**
 * @since 3.0.0
 */
export const idKind: <A>() => (a: A) => IOOption<A> = /*#__PURE__*/ fromIdentity.idKind(FromIdentity)

/**
 * @category instances
 * @since 3.0.0
 */
export const CategoryKind: categoryKind.CategoryKind<IOOptionTypeLambda> = {
  composeKind,
  idKind
}

/**
 * Sequences the specified effect after this effect, but ignores the value
 * produced by the effect.
 *
 * @category sequencing
 * @since 3.0.0
 */
export const zipLeft: (that: IOOption<unknown>) => <A>(self: IOOption<A>) => IOOption<A> =
  /*#__PURE__*/ flattenable.zipLeft(Flattenable)

/**
 * A variant of `flatMap` that ignores the value produced by this effect.
 *
 * @category sequencing
 * @since 3.0.0
 */
export const zipRight: <A>(that: IOOption<A>) => (self: IOOption<unknown>) => IOOption<A> =
  /*#__PURE__*/ flattenable.zipRight(Flattenable)

/**
 * @since 3.0.0
 */
export const ap: <A>(fa: IOOption<A>) => <B>(fab: IOOption<(a: A) => B>) => IOOption<B> =
  /*#__PURE__*/ flattenable.ap(Flattenable)

/**
 * @since 3.0.0
 */
export const flatten: <A>(mma: IOOption<IOOption<A>>) => IOOption<A> = /*#__PURE__*/ flatMap(identity)

/**
 * Lazy version of `orElse`.
 *
 * @category error handling
 * @since 3.0.0
 */
export const catchAll: <B>(that: LazyArg<IOOption<B>>) => <A>(self: IOOption<A>) => IOOption<A | B> =
  /*#__PURE__*/ optionT.catchAll(io.Monad)

/**
 * @since 3.0.0
 */
export const orElse: <B>(that: IOOption<B>) => <A>(self: IOOption<A>) => IOOption<A | B> = /*#__PURE__*/ optionT.orElse(
  io.Monad
)

/**
 * @category filtering
 * @since 3.0.0
 */
export const filterMap: <A, B>(f: (a: A) => Option<B>) => (fga: IOOption<A>) => IOOption<B> =
  /*#__PURE__*/ filterable.filterMapComposition(io.Functor, option.Filterable)

/**
 * @category filtering
 * @since 3.0.0
 */
export const partitionMap: <A, B, C>(
  f: (a: A) => Either<B, C>
) => (fa: IOOption<A>) => readonly [IOOption<B>, IOOption<C>] = /*#__PURE__*/ filterable.partitionMapComposition(
  io.Functor,
  option.Filterable
)

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

/**
 * @category instances
 * @since 3.0.0
 */
export const Functor: functor.Functor<IOOptionTypeLambda> = {
  map
}

/**
 * @category mapping
 * @since 3.0.0
 */
export const flap: <A>(a: A) => <B>(fab: IOOption<(a: A) => B>) => IOOption<B> = /*#__PURE__*/ functor.flap(Functor)

/**
 * Maps the success value of this effect to the specified constant value.
 *
 * @category mapping
 * @since 3.0.0
 */
export const as: <B>(b: B) => (self: IOOption<unknown>) => IOOption<B> = /*#__PURE__*/ functor.as(Functor)

/**
 * Returns the effect resulting from mapping the success of this effect to unit.
 *
 * @category mapping
 * @since 3.0.0
 */
export const unit: (self: IOOption<unknown>) => IOOption<void> = /*#__PURE__*/ functor.unit(Functor)

/**
 * @category instances
 * @since 3.0.0
 */
export const Apply: apply.Apply<IOOptionTypeLambda> = {
  map,
  ap
}

/**
 * Lifts a binary function into `IOOption`.
 *
 * @category lifting
 * @since 3.0.0
 */
export const lift2: <A, B, C>(f: (a: A, b: B) => C) => (fa: IOOption<A>, fb: IOOption<B>) => IOOption<C> =
  /*#__PURE__*/ apply.lift2(Apply)

/**
 * Lifts a ternary function into `IOOption`.
 *
 * @category lifting
 * @since 3.0.0
 */
export const lift3: <A, B, C, D>(
  f: (a: A, b: B, c: C) => D
) => (fa: IOOption<A>, fb: IOOption<B>, fc: IOOption<C>) => IOOption<D> = /*#__PURE__*/ apply.lift3(Apply)

/**
 * @category instances
 * @since 3.0.0
 */
export const Applicative: applicative.Applicative<IOOptionTypeLambda> = {
  map,
  ap,
  of
}

/**
 * Returns an effect that effectfully "peeks" at the success of this effect.
 *
 * @since 3.0.0
 */
export const tap: <A>(f: (a: A) => IOOption<unknown>) => (self: IOOption<A>) => IOOption<A> =
  /*#__PURE__*/ flattenable.tap(Flattenable)

/**
 * Returns an effect that effectfully "peeks" at the failure of this effect.
 *
 * @category error handling
 * @since 3.0.0
 */
export const tapError: (onNone: IOOption<unknown>) => <A>(self: IOOption<A>) => IOOption<A> =
  /*#__PURE__*/ optionT.tapError(io.Monad)

/**
 * @category instances
 * @since 3.0.0
 */
export const SemigroupKind: semigroupKind.SemigroupKind<IOOptionTypeLambda> = {
  combineKind: orElse
}

/**
 * @category instances
 * @since 3.0.0
 */
export const MonoidKind: monoidKind.MonoidKind<IOOptionTypeLambda> = {
  combineKind: orElse,
  emptyKind: emptyKind
}

/**
 * @category do notation
 * @since 3.0.0
 */
export const guard: (b: boolean) => IOOption<void> = /*#__PURE__*/ monoidKind.guard(MonoidKind, FromIdentity)

/**
 * @category instances
 * @since 3.0.0
 */
export const Monad: monad.Monad<IOOptionTypeLambda> = {
  map,
  of,
  flatMap
}

/**
 * @category filtering
 * @since 3.0.0
 */
export const compact: <A>(foa: IOOption<option.Option<A>>) => IOOption<A> =
  /*#__PURE__*/ compactable.compactComposition(io.Functor, option.Compactable)

/**
 * @category instances
 * @since 3.0.0
 */
export const Compactable: compactable.Compactable<IOOptionTypeLambda> = {
  compact
}

/**
 * @category filtering
 * @since 3.0.0
 */
export const separate: <A, B>(fe: IOOption<Either<A, B>>) => readonly [IOOption<A>, IOOption<B>] =
  /*#__PURE__*/ compactable.separate(Functor, Compactable)

/**
 * @category instances
 * @since 3.0.0
 */
export const Filterable: filterable.Filterable<IOOptionTypeLambda> = {
  filterMap,
  partitionMap
}

/**
 * @category filtering
 * @since 3.0.0
 */
export const filter: {
  <C extends A, B extends A, A = C>(refinement: Refinement<A, B>): (fc: IOOption<C>) => IOOption<B>
  <B extends A, A = B>(predicate: Predicate<A>): (fb: IOOption<B>) => IOOption<B>
} = /*#__PURE__*/ filterable.filter(Filterable)

/**
 * @category filtering
 * @since 3.0.0
 */
export const partition: {
  <C extends A, B extends A, A = C>(refinement: Refinement<A, B>): (
    fc: IOOption<C>
  ) => readonly [IOOption<C>, IOOption<B>]
  <B extends A, A = B>(predicate: Predicate<A>): (fb: IOOption<B>) => readonly [IOOption<B>, IOOption<B>]
} = /*#__PURE__*/ filterable.partition(Filterable)

/**
 * @category instances
 * @since 3.0.0
 */
export const FromIO: fromIO_.FromIO<IOOptionTypeLambda> = {
  fromIO
}

// -------------------------------------------------------------------------------------
// logging
// -------------------------------------------------------------------------------------

/**
 * @category logging
 * @since 3.0.0
 */
export const log: (...x: ReadonlyArray<unknown>) => IOOption<void> = /*#__PURE__*/ fromIO_.log(FromIO)

/**
 * @category logging
 * @since 3.0.0
 */
export const logError: (...x: ReadonlyArray<unknown>) => IOOption<void> = /*#__PURE__*/ fromIO_.logError(FromIO)

/**
 * @category lifting
 * @since 3.0.0
 */
export const liftIO: <A extends ReadonlyArray<unknown>, B>(f: (...a: A) => IO<B>) => (...a: A) => IOOption<B> =
  /*#__PURE__*/ fromIO_.liftIO(FromIO)

/**
 * @category sequencing
 * @since 3.0.0
 */
export const flatMapIO: <A, B>(f: (a: A) => IO<B>) => (self: IOOption<A>) => IOOption<B> =
  /*#__PURE__*/ fromIO_.flatMapIO(FromIO, Flattenable)

/**
 * @category instances
 * @since 3.0.0
 */
export const FromOption: fromOption_.FromOption<IOOptionTypeLambda> = {
  fromOption
}

/**
 * @category lifting
 * @since 3.0.0
 */
export const liftPredicate: {
  <C extends A, B extends A, A = C>(refinement: Refinement<A, B>): (c: C) => IOOption<B>
  <B extends A, A = B>(predicate: Predicate<A>): (b: B) => IOOption<B>
} = /*#__PURE__*/ fromOption_.liftPredicate(FromOption)

/**
 * @category lifting
 * @since 3.0.0
 */
export const liftOption: <A extends ReadonlyArray<unknown>, B>(f: (...a: A) => Option<B>) => (...a: A) => IOOption<B> =
  /*#__PURE__*/ fromOption_.liftOption(FromOption)

/**
 * @category conversions
 * @since 3.0.0
 */
export const fromNullable: <A>(a: A) => IOOption<NonNullable<A>> = /*#__PURE__*/ fromOption_.fromNullable(FromOption)

/**
 * @category lifting
 * @since 3.0.0
 */
export const liftNullable: <A extends ReadonlyArray<unknown>, B>(
  f: (...a: A) => B | null | undefined
) => (...a: A) => IOOption<NonNullable<B>> = /*#__PURE__*/ fromOption_.liftNullable(FromOption)

/**
 * @category sequencing
 * @since 3.0.0
 */
export const flatMapNullable: <A, B>(
  f: (a: A) => B | null | undefined
) => (ma: IOOption<A>) => IOOption<NonNullable<B>> = /*#__PURE__*/ fromOption_.flatMapNullable(FromOption, Flattenable)

/**
 * @category instances
 * @since 3.0.0
 */
export const FromEither: fromEither_.FromEither<IOOptionTypeLambda> = {
  fromEither
}

/**
 * @category lifting
 * @since 3.0.0
 */
export const liftEither: <A extends ReadonlyArray<unknown>, E, B>(
  f: (...a: A) => Either<E, B>
) => (...a: A) => IOOption<B> = /*#__PURE__*/ fromEither_.liftEither(FromEither)

/**
 * @category sequencing
 * @since 3.0.0
 */
export const flatMapEither: <A, E, B>(f: (a: A) => Either<E, B>) => (ma: IOOption<A>) => IOOption<B> =
  /*#__PURE__*/ fromEither_.flatMapEither(FromEither, Flattenable)

// -------------------------------------------------------------------------------------
// do notation
// -------------------------------------------------------------------------------------

/**
 * @category do notation
 * @since 3.0.0
 */
export const Do: IOOption<{}> = /*#__PURE__*/ of(_.Do)

/**
 * @category do notation
 * @since 3.0.0
 */
export const bindTo: <N extends string>(name: N) => <A>(self: IOOption<A>) => IOOption<{ readonly [K in N]: A }> =
  /*#__PURE__*/ functor.bindTo(Functor)

const let_: <N extends string, A extends object, B>(
  name: Exclude<N, keyof A>,
  f: (a: A) => B
) => (self: IOOption<A>) => IOOption<{ readonly [K in N | keyof A]: K extends keyof A ? A[K] : B }> =
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
export const bind: <N extends string, A extends object, B>(
  name: Exclude<N, keyof A>,
  f: (a: A) => IOOption<B>
) => (self: IOOption<A>) => IOOption<{ readonly [K in N | keyof A]: K extends keyof A ? A[K] : B }> =
  /*#__PURE__*/ flattenable.bind(Flattenable)

/**
 * A variant of `bind` that sequentially ignores the scope.
 *
 * @category do notation
 * @since 3.0.0
 */
export const bindRight: <N extends string, A extends object, B>(
  name: Exclude<N, keyof A>,
  fb: IOOption<B>
) => (self: IOOption<A>) => IOOption<{ readonly [K in N | keyof A]: K extends keyof A ? A[K] : B }> =
  /*#__PURE__*/ apply.bindRight(Apply)

// -------------------------------------------------------------------------------------
// tuple sequencing
// -------------------------------------------------------------------------------------

/**
 * @category tuple sequencing
 * @since 3.0.0
 */
export const Zip: IOOption<readonly []> = /*#__PURE__*/ of(_.Zip)

/**
 * @category tuple sequencing
 * @since 3.0.0
 */
export const tupled: <A>(self: IOOption<A>) => IOOption<readonly [A]> = /*#__PURE__*/ functor.tupled(Functor)

/**
 * Sequentially zips this effect with the specified effect.
 *
 * @category tuple sequencing
 * @since 3.0.0
 */
export const zipFlatten: <B>(
  fb: IOOption<B>
) => <A extends ReadonlyArray<unknown>>(self: IOOption<A>) => IOOption<readonly [...A, B]> =
  /*#__PURE__*/ apply.zipFlatten(Apply)

/**
 * Sequentially zips this effect with the specified effect using the specified combiner function.
 *
 * @category tuple sequencing
 * @since 3.0.0
 */
export const zipWith: <B, A, C>(that: IOOption<B>, f: (a: A, b: B) => C) => (self: IOOption<A>) => IOOption<C> =
  /*#__PURE__*/ apply.zipWith(Apply)

// -------------------------------------------------------------------------------------
// array utils
// -------------------------------------------------------------------------------------

/**
 * Equivalent to `ReadonlyNonEmptyArray#traverseWithIndex(Apply)`.
 *
 * @category traversing
 * @since 3.0.0
 */
export const traverseReadonlyNonEmptyArrayWithIndex = <A, B>(
  f: (index: number, a: A) => IOOption<B>
): ((as: ReadonlyNonEmptyArray<A>) => IOOption<ReadonlyNonEmptyArray<B>>) =>
  flow(io.traverseReadonlyNonEmptyArrayWithIndex(f), io.map(option.traverseReadonlyNonEmptyArrayWithIndex(SK)))

/**
 * Equivalent to `ReadonlyArray#traverseWithIndex(Applicative)`.
 *
 * @category traversing
 * @since 3.0.0
 */
export const traverseReadonlyArrayWithIndex = <A, B>(
  f: (index: number, a: A) => IOOption<B>
): ((as: ReadonlyArray<A>) => IOOption<ReadonlyArray<B>>) => {
  const g = traverseReadonlyNonEmptyArrayWithIndex(f)
  return (as) => (_.isNonEmpty(as) ? g(as) : Zip)
}

/**
 * Equivalent to `ReadonlyNonEmptyArray#traverse(Apply)`.
 *
 * @category traversing
 * @since 3.0.0
 */
export const traverseReadonlyNonEmptyArray = <A, B>(
  f: (a: A) => IOOption<B>
): ((as: ReadonlyNonEmptyArray<A>) => IOOption<ReadonlyNonEmptyArray<B>>) => {
  return traverseReadonlyNonEmptyArrayWithIndex(flow(SK, f))
}

/**
 * Equivalent to `ReadonlyArray#traverse(Applicative)`.
 *
 * @category traversing
 * @since 3.0.0
 */
export const traverseReadonlyArray = <A, B>(
  f: (a: A) => IOOption<B>
): ((as: ReadonlyArray<A>) => IOOption<ReadonlyArray<B>>) => {
  return traverseReadonlyArrayWithIndex(flow(SK, f))
}

/**
 * Equivalent to `ReadonlyArray#sequence(Applicative)`.
 *
 * @category traversing
 * @since 3.0.0
 */
export const sequenceReadonlyArray: <A>(arr: ReadonlyArray<IOOption<A>>) => IOOption<ReadonlyArray<A>> =
  /*#__PURE__*/ traverseReadonlyArray(identity)
