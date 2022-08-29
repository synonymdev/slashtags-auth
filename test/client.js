import test from 'brittle'
import Slashtag from '@synonymdev/slashtag'
import createTestnet from '@hyperswarm/testnet'

import * as auth from '../index.js'

test('', async t => {
  const testnet = await createTestnet(3, t.teardown)

  const serverSlashtag = new Slashtag(testnet)
  const clientSlashtag = new Slashtag(testnet)

  const server = new auth.Server(serverSlashtag)
  await serverSlashtag.listen()

  const client = new auth.Client(clientSlashtag)

  const response = await client.request(serverSlashtag.url)

  console.log({ response })

  clientSlashtag.close()
  serverSlashtag.close()
})
