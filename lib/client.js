import RPC from '@synonymdev/slashtags-rpc'
import { parse } from '@synonymdev/slashtags-url'
import c from 'compact-encoding'

import { RPC_ID } from './constants.js'

export class SlashtagsAuthClient extends RPC {
  get id () {
    return RPC_ID
  }

  get valueEncoding () {
    return c.string
  }

  async request (url) {
    const rpc = await this.rpc(url)
    return rpc.request('auth', url)
  }
}

export default SlashtagsAuthClient
