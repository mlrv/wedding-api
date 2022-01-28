import { create } from './api/server'

const server = create()

server.listen(8000, () => console.log('Running...'))
