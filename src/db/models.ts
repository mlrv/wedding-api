import { types, schema } from 'papr'

const diet = [
  'omnivore' as const,
  'pescatarian' as const,
  'vegetarian' as const,
  'vegan' as const,
  'gluten_free' as const,
]

export const party = schema({
  email: types.string({ required: true }),
  code: types.string({ required: true }),
  guests: types.array(
    types.object({
      name: types.string({ required: true }),
      coming: types.boolean(),
      diet: types.enum(Object.values(diet)),
      comments: types.string(),
    }),
  ),
})

export type UnconfirmedGuest = {
  name: string
}

export type ConfirmedGuestComing = UnconfirmedGuest & {
  coming: true
  diet: typeof diet[number]
  comments?: string
}

export type ConfirmedGuestNotComing = UnconfirmedGuest & {
  coming: false
  comments?: string
}

export type ConfirmedGuest = ConfirmedGuestComing | ConfirmedGuestNotComing

export type Guest = UnconfirmedGuest | ConfirmedGuest

export type Party = { email: string; code: string; guests: Guest[] }
