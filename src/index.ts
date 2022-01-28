import { flow } from 'fp-ts/function'
import { create } from './api/server'
import { connect } from './db/papr'

const main = flow(connect, create, server =>
  server.listen(process.env.PORT || 8000, () => console.log('Running...')),
)

main()
