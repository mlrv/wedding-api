import { types, schema } from 'papr'

const diet = [
  'omnivore' as const,
  'pescatarian' as const,
  'vegetarian' as const,
  'vegan' as const,
]

export const party = schema({
  email: types.string({ required: true }),
  code: types.string({ required: true }),
  guests: types.array(
    types.object({
      name: types.string({ required: true }),
      coming: types.boolean({ required: true }),
      diet: types.enum(Object.values(diet), { required: true }),
      comments: types.string(),
    }),
  ),
})

export type Guest = {
  name: string
  coming: boolean
  diet: typeof diet[number]
  comments?: string
}

export type Party = { email: string; code: string; guests: Guest[] }
