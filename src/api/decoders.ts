import * as D from 'io-ts/Decoder'
import { pipe } from 'fp-ts/function'

const Diet = D.union(
  D.literal('omnivore'),
  D.literal('pescatarian'),
  D.literal('vegetarian'),
  D.literal('vegan'),
  D.literal('gluten_free'),
)

const Comments = D.partial({
  comments: D.string,
})

const UnconfirmedGuest = D.struct({
  name: D.string,
})

const ConfirmedGuestBase = D.intersect(Comments)(UnconfirmedGuest)

const ConfirmedGuestComing = pipe(
  D.struct({
    coming: D.literal(true),
    diet: Diet,
  }),
  D.intersect(ConfirmedGuestBase),
)

const ConfirmedGuestNotComing = pipe(
  D.struct({
    coming: D.literal(false),
  }),
  D.intersect(ConfirmedGuestBase),
)

const ConfirmedGuest = D.union(ConfirmedGuestComing, ConfirmedGuestNotComing)

const Locale = D.union(D.literal('gb'), D.literal('it'))

const PartyStructOne = {
  email: D.string,
  guests: D.array(ConfirmedGuest),
}

const PartyStructMany = {
  email: D.string,
  code: D.string,
  guests: D.array(UnconfirmedGuest),
}

export const PartyPOSTMany = D.array(D.struct(PartyStructMany))
export const PartyPOSTOne = D.struct(PartyStructOne)
export const PartyPUTOne = D.struct({
  locale: Locale,
  update: D.partial(PartyStructOne),
})
