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
        name: 'auth',
        options: {
          responseEncoding: c.bool
        },
        handler: self.auth.bind(self)
      },
      {
        name: 'magiclink',
        handler: self.magiclink.bind(self)
      }
    ]
  }

  async auth (req, socket) {
    return await this.onauthz(req, socket.remoteSlashtag)
  }

  async magiclink (req, socket) {
    return await this.onmagiclink(socket.remoteSlashtag)
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
 * @typedef {import('@synonymdev/slashtag').SecretStream['remoteSlashtag']} RemoteSlashtag
 * @typedef {(token: string, remote: RemoteSlashtag) => boolean | Promise<boolean>} OnAuthz
 * @typedef {(remote: RemoteSlashtag) => string | Promise<string>} OnMagicLink
 */
