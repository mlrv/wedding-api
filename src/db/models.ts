import { types, schema } from 'papr'

export enum Diet {
  omnivore = 'omnivore',
  pescatarian = 'pescatarian',
  vegeterian = 'vegetarian',
  vegan = 'vegan',
}

export const party = schema({
  email: types.string({ required: true }),
  password: types.string({ required: true }),
  guests: types.array(
    types.object({
      name: types.string({ required: true }),
      surname: types.string({ required: true }),
      coming: types.boolean({ required: true }),
      diet: types.enum(Object.values(Diet), { required: true }),
      comments: types.string(),
    }),
  ),
})

export type Guest = {
  name: string
  surname: string
  coming: boolean
  diet: Diet
  comments?: string
}

export type Party = { email: string; password: string; guests: Guest[] }
