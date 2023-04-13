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
    onauthz: (_token, remotePublicKey) => {
      st.is(_token, token)
      st.alike(remotePublicKey, bob.key)
      return { status: 'ok' }
    }
  })

  const url = server.formatURL(token)
  t.ok(url.startsWith('slashauth:'))
  await alice.listen()

  const client = new auth.Client(bob)
  const response = await client.authz(url)

  t.is(response.status, 'ok')

  await st

  await alice.close()
  await bob.close()
})

test('autz - reject', async t => {
  const testnet = await createTestnet(3, t.teardown)

  const alice = new Slashtag(testnet)
  const bob = new Slashtag(testnet)

  const server = new auth.Server(alice, {
    onauthz: () => {
      return { status: 'error', message: 'You are blocked' }
    }
  })

  const url = server.formatURL('..')
  await alice.listen()

  const client = new auth.Client(bob)
  const response = await client.authz(url)

  t.is(response.status, 'error')
  t.is(response.message, 'You are blocked')

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
    onmagiclink: remotePublicKey => {
      st.alike(remotePublicKey, bob.key)
      return { url: magiclink, validUntil: 1000000 }
    }
  })

  await server.slashtag.listen()

  const client = new auth.Client(bob)
  const response = await client.magiclink(alice.url)

  t.is(response.url, magiclink)
  t.is(response.validUntil, 1000000)

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
  await t.exception(client.authz(alice.url + '?q=foo'), /Authz not implemented/)

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

test('authz - with account feed url', async t => {
  const testnet = await createTestnet(3, t.teardown)

  const alice = new Slashtag(testnet)
  const bob = new Slashtag(testnet)

  const st = t.test('auth')
  st.plan(2)

  const token = Math.random()
    .toString(16)
    .slice(2, 6)

  const accountFeedUrl = 'slashfeed:foobar?encryptionKey=42'

  const server = new auth.Server(alice, {
    onauthz: (_token, remotePublicKey) => {
      st.is(_token, token)
      st.alike(remotePublicKey, bob.key)
      return {
        status: 'ok',
        feed: accountFeedUrl
      }
    }
  })

  const url = server.formatURL(token)
  t.ok(url.startsWith('slashauth:'))
  await alice.listen()

  const client = new auth.Client(bob)
  const response = await client.authz(url)

  t.is(response.status, 'ok')
  t.is(response.feed, accountFeedUrl)

  await st

  await alice.close()
  await bob.close()
})
