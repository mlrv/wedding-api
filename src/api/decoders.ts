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

const PartyStruct = {
  email: D.string,
  guests: D.array(Guest),
}

export const PartyPOST = D.struct(PartyStruct)
export const PartyPUT = D.partial(PartyStruct)
