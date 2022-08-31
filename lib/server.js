import { format } from '@synonymdev/slashtags-url'
import c from 'compact-encoding'

import { Base } from './base.js'

export class SlashtagsAuthServer extends Base {
  /**
   * @param {import('@synonymdev/slashtag').Slashtag} slashtag
   * @param {{onauthz?: OnAuthz, onmagiclink?: OnMagicLink}} [opts]
   */
  constructor (slashtag, opts) {
    super(slashtag)
    this.onauthz = opts?.onauthz || noauthz
    this.onmagiclink = opts?.onmagiclink || nomagiclink
  }

  get methods () {
    const self = this
    return [
      {
        name: 'authz',
        options: { responseEncoding: c.bool },
        handler: self.authz.bind(self)
      },
      {
        name: 'magiclink',
        handler: self.magiclink.bind(self)
      }
    ]
  }

  async authz (req, socket) {
    return this.onauthz(req, socket.remotePublicKey)
  }

  async magiclink (req, socket) {
    return this.onmagiclink(socket.remotePublicKey)
  }

  /**
   * Format a `slashauth:<z-base32 this.slashtag.id>?q=token` URL.
   * @param {string} token
   */
  formatURL (token) {
    return format(this.slashtag.key, { query: { q: token } })
  }
}

export default SlashtagsAuthServer

function nomagiclink () {
  throw new Error('Magic link not implemented')
}
function noauthz () {
  throw new Error('Authz not implemented')
}

/**
 * @typedef {(token: string, remotePublicKey: Uint8Array) => boolean | Promise<boolean>} OnAuthz
 * @typedef {(remotePublicKey: Uint8Array) => string | Promise<string>} OnMagicLink
 */
