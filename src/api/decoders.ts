import * as D from 'io-ts/Decoder'
import { pipe } from 'fp-ts/function'

const Diet = D.union(
  D.literal('omnivore'),
  D.literal('pescatarian'),
  D.literal('vegetarian'),
  D.literal('vegan'),
)

const Comments = D.partial({
  comments: D.string,
})

const Guest = pipe(
  D.struct({
    name: D.string,
    coming: D.boolean,
    diet: Diet,
  }),
  D.intersect(Comments),
)

export const Party = D.struct({
  email: D.string,
  code: D.string,
  guests: D.array(Guest),
})
