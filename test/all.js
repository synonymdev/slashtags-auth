import test from 'brittle'
import Slashtag from '@synonymdev/slashtag'
import createTestnet from '@hyperswarm/testnet'

import * as auth from '../index.js'

test('authz', async t => {
  const testnet = await createTestnet(3, t.teardown)

  const alice = new Slashtag(testnet)
  const bob = new Slashtag(testnet)

  const st = t.test('auth')
  st.plan(2)

  const token = Math.random()
    .toString(16)
    .slice(2, 6)

  const server = new auth.Server(alice, {
    onauthz: (_token, remote) => {
      st.is(_token, token)
      st.is(remote.id, bob.id)
      return true
    }
  })

  const url = server.formatURL(token)
  await alice.listen()

  const client = new auth.Client(bob)
  const response = await client.authz(url)

  t.ok(response)

  await st

  await alice.close()
  await bob.close()
})

test('magic link', async t => {
  const testnet = await createTestnet(3, t.teardown)

  const alice = new Slashtag(testnet)
  const bob = new Slashtag(testnet)

  const st = t.test('auth')
  st.plan(1)

  const magiclink = 'https://www.example.com/user?q=one-time-pass'

  const server = new auth.Server(alice, {
    onmagiclink: remote => {
      st.is(remote.id, bob.id)
      return magiclink
    }
  })

  await server.slashtag.listen()

  const client = new auth.Client(bob)
  const response = await client.magiclink(alice.url)

  t.is(response, magiclink)

  await alice.close()
  await bob.close()
})

test('missing callback', async t => {
  const testnet = await createTestnet(3, t.teardown)

  const alice = new Slashtag(testnet)
  const bob = new Slashtag(testnet)

  const server = new auth.Server(alice, {})

  await server.slashtag.listen()

  const client = new auth.Client(bob)

  await t.exception(client.magiclink(alice.url), /Magic link not implemented/)
  // await t.exception(client.authz(alice.url + '?q=foo'), /Authz not implemented/)

  await alice.close()
  await bob.close()
})

test('authz - missing token', async t => {
  const testnet = await createTestnet(3, t.teardown)

  const alice = new Slashtag(testnet)
  const bob = new Slashtag(testnet)

  const server = new auth.Server(alice)

  await server.slashtag.listen()

  const client = new auth.Client(bob)
  await t.exception(client.authz(alice.url), /Missing token in slashauth url/)

  await alice.close()
  await bob.close()
})
