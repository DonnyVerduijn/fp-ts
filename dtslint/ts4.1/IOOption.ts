import * as _ from '../../src/IOOption'
import { pipe } from '../../src/f'

declare const n: number
declare const sn: string | number
declare const isString: (u: unknown) => u is string
declare const predicate: (sn: string | number) => boolean

// -------------------------------------------------------------------------------------
// fromPredicate
// -------------------------------------------------------------------------------------

// $ExpectType IOOption<string>
pipe(sn, _.liftPredicate(isString))
pipe(
  sn,
  _.liftPredicate(
    (
      n // $ExpectType string | number
    ): n is number => typeof n === 'number'
  )
)

// $ExpectType IOOption<string | number>
pipe(sn, _.liftPredicate(predicate))
// $ExpectType IOOption<number>
pipe(n, _.liftPredicate(predicate))
// $ExpectType IOOption<number>
pipe(
  n,
  _.liftPredicate(
    (
      _n // $ExpectType number
    ) => true
  )
)
