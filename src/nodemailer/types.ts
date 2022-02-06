export type Locale = 'gb' | 'it'

export type EmailResponseType =
	| { kind: 'generic' }
	| { kind: 'coming' }
	| { kind: 'notComing' }