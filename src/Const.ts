/**
 * The `Const` type constructor, which wraps its first type argument and ignores its second.
 * That is, `Const<E, A>` is isomorphic to `E` for any `A`.
 *
 * `Const` has some useful instances. For example, the `Applicative` instance allows us to collect results using a `Monoid`
 * while ignoring return values.
 *
 * @since 3.0.0
 */
import { Applicative2C } from './Applicative'
import { Apply2C } from './Apply'
import { Bifunctor2, mapLeftDefault } from './Bifunctor'
import { BooleanAlgebra } from './BooleanAlgebra'
import { Bounded } from './Bounded'
import { Contravariant2 } from './Contravariant'
import { Eq } from './Eq'
import { identity, unsafeCoerce } from './function'
import { Functor2 } from './Functor'
import { HeytingAlgebra } from './HeytingAlgebra'
import { Monoid } from './Monoid'
import { Ord } from './Ord'
import { Ring } from './Ring'
import { Semigroup } from './Semigroup'
import { Semiring } from './Semiring'
import { Show } from './Show'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category model
 * @since 3.0.0
 */
export type Const<E, A> = E & { readonly _A: A }

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * @category constructors
 * @since 3.0.0
 */
export const make: <E, A = never>(e: E) => Const<E, A> = unsafeCoerce

// -------------------------------------------------------------------------------------
// type class members
// -------------------------------------------------------------------------------------

/**
 * @category Contravariant
 * @since 3.0.0
 */
export const contramap: Contravariant2<URI>['contramap'] = () => unsafeCoerce

/**
 * `map` can be used to turn functions `(a: A) => B` into functions `(fa: F<A>) => F<B>` whose argument and return types
 * use the type constructor `F` to represent some computational context.
 *
 * @category Functor
 * @since 3.0.0
 */
export const map: Functor2<URI>['map'] = () => unsafeCoerce

/**
 * Map a pair of functions over the two type arguments of the bifunctor.
 *
 * @category Bifunctor
 * @since 3.0.0
 */
export const bimap: Bifunctor2<URI>['bimap'] = (f) => (fa) => make(f(fa))

/**
 * Map a function over the first type argument of a bifunctor.
 *
 * @category Bifunctor
 * @since 3.0.0
 */
export const mapLeft: Bifunctor2<URI>['mapLeft'] =
  /*#__PURE__*/
  mapLeftDefault<URI>(bimap)

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

/**
 * @category instances
 * @since 3.0.0
 */
export type URI = 'Const'

declare module './HKT' {
  interface URItoKind2<E, A> {
    readonly Const: Const<E, A>
  }
}

/**
 * @category instances
 * @since 3.0.0
 */
export const getShow = <E, A>(S: Show<E>): Show<Const<E, A>> => ({
  show: (c) => `make(${S.show(c)})`
})

/**
 * @category instances
 * @since 3.0.0
 */
export const getEq: <E, A>(E: Eq<E>) => Eq<Const<E, A>> = identity

/**
 * @category instances
 * @since 3.0.0
 */
export const getOrd: <E, A>(O: Ord<E>) => Ord<Const<E, A>> = identity

/**
 * @category instances
 * @since 3.0.0
 */
export const getBounded: <E, A>(B: Bounded<E>) => Bounded<Const<E, A>> = identity as any

/**
 * @category instances
 * @since 3.0.0
 */
export const getSemigroup: <E, A>(S: Semigroup<E>) => Semigroup<Const<E, A>> = identity as any

/**
 * @category instances
 * @since 3.0.0
 */
export const getMonoid: <E, A>(M: Monoid<E>) => Monoid<Const<E, A>> = identity as any

/**
 * @category instances
 * @since 3.0.0
 */
export const getSemiring: <E, A>(S: Semiring<E>) => Semiring<Const<E, A>> = identity as any

/**
 * @category instances
 * @since 3.0.0
 */
export const getRing: <E, A>(S: Ring<E>) => Ring<Const<E, A>> = identity as any

/**
 * @category instances
 * @since 3.0.0
 */
export const getHeytingAlgebra: <E, A>(H: HeytingAlgebra<E>) => HeytingAlgebra<Const<E, A>> = identity as any

/**
 * @category instances
 * @since 3.0.0
 */
export const getBooleanAlgebra: <E, A>(H: BooleanAlgebra<E>) => BooleanAlgebra<Const<E, A>> = identity as any

/**
 * @category instances
 * @since 3.0.0
 */
export const Functor: Functor2<URI> = {
  map
}

/**
 * @category instances
 * @since 3.0.0
 */
export const Contravariant: Contravariant2<URI> = {
  contramap
}

/**
 * @category instances
 * @since 3.0.0
 */
export const Bifunctor: Bifunctor2<URI> = {
  bimap,
  mapLeft
}
/**
 * @category instances
 * @since 3.0.0
 */
export const getApply = <E>(S: Semigroup<E>): Apply2C<URI, E> => ({
  map,
  ap: (fa) => (fab) => make(S.concat(fa)(fab))
})

/**
 * @category instances
 * @since 3.0.0
 */
export const getApplicative = <E>(M: Monoid<E>): Applicative2C<URI, E> => {
  const A = getApply(M)
  return {
    map: A.map,
    ap: A.ap,
    of: () => make(M.empty)
  }
}
