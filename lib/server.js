import RPC from '@synonymdev/slashtags-rpc'
import { parse } from '@synonymdev/slashtags-url'
import c from 'compact-encoding'

import { RPC_ID } from './constants.js'

export class SlashtagsAuthServer extends RPC {
  get id () {
    return RPC_ID
  }

  get valueEncoding () {
    return c.string
  }

  get methods () {
    return [
      {
        name: 'auth',
        handler: req => {
          console.log(req)
          return 'true'
        }
      }
    ]
  }
}

export default SlashtagsAuthServer
