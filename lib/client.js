import { parse } from '@synonymdev/slashtags-url'
import c from 'compact-encoding'

import { Base } from './base.js'

export class SlashtagsAuthClient extends Base {
  /**
   * Authorize an app by sending the token to the resource provider
   * @param {string} url
   * @returns  {Promise<boolean>}
   */
  async authz (url) {
    const rpc = await this.rpc(url)
    const parsed = parse(url)
    const token = parse(url).query.q
    if (!token) throw new Error('Missing token in slashauth url')

    return !!rpc.request('auth', parsed.query?.q, { responseEncoding: c.bool })
  }

  /**
   * Request a passwordless magic link from Server
   * @param {string} url
   * @returns  {Promise<string>}
   */
  async magiclink (url) {
    const rpc = await this.rpc(url)
    return rpc.request('magiclink', null, { requestEncoding: c.buffer })
  }
}

export default SlashtagsAuthClient
