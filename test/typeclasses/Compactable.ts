import * as _ from '../../src/typeclasses/Compactable'
import * as U from '../util'
import * as RA from '../../src/ReadonlyArray'
import * as E from '../../src/Result'

describe('Compactable', () => {
  it('separate', () => {
    const separate = _.separate(RA.Functor, RA.Compactable)
    U.deepStrictEqual(separate([]), [[], []])
    U.deepStrictEqual(separate([E.fail(123), E.succeed('123')]), [[123], ['123']])
  })
})