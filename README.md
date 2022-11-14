# slashtags-auth

P2P authorization and bidirectional authentication with holepunching through Hyperswarm.

## Installation

```bash
npm install @synonymdev/slashtags-auth
```

## Usage

### Server side

```js
import SDK from '@synonymdev/slashtags-sdk'
import { Server } from '@synonymdev/slashtags-auth'

const sdk = new SDK({ primaryKey: <32 bytes secret key> })

const slashtag = sdk.slashtag()

const server = new Server(slashtag, {
    onauthz: (token, remote) => {
        // Check that token is valid, and remote isn't blocked
        return true
    },
    onmagiclink: (remote) => {
        return 'https://www.example.com?q=foobar'
    }
})

const slashauthURL = server.fromatURL(token)
```

### Client side

```js
import SDK from '@synonymdev/slashtags-sdk'
import { Client } from '@synonymdev/slashtags-auth'

const sdk = new SDK({ primaryKey: <32 bytes secret key> })

const slashtag = sdk.slashtag()

const client = new Client(slashtag)

// Authorize an app by scanning a slashauth: url
const response = client.authz(url)
// true or false

// Request a magicLink from the server's slashtag url
const link =  client.magiclik(url)
```

## How does it work

#### authz

1- `Server` announces its IP and port on Hyperswarm `DHT`.
2- `Server` formats its publicKey as `slashauth:<zbase32 publicKey>?q=<token>`
    where `token` is an represents either a session id, or client id or any internal
    identification of the `Client` it should send requested resources to.
3- `Client` shows the url as a QR code to the `Wallet`.
4- `Wallet` parses the url and optain the `Server`'s publicKey and client token.
5- `Wallet` queries the DHT for the `Server`'s IP and port using its public key.
6- `Wallet` establishes a secure connection with thes `Server`, confirming its publicKey,
    and pass the `token` to auhtorize the `Client`.
7- `Server` verifies the token, and confirms the success to the client.
    In parallel, the server now knows the `Wallet` publicKey and can save it in its users table / collection.
8- Finally `Server` grants `Client` the requested resources started a logged in session.

```
+-----------+   +-----------+   +-----------+   +-----------+       
|    DHT    |   |  Server   |   |  Client   |   |   Wallet  |       
+-----------+   +-----------+   +-----------+   +-----------+       
      |               |               |               |             
      |   Announce    |               |               |             
      |<--------------|               |               |             
      |               |               |               |             
      |               | slashauth:... |               |             
      |               |-------------->|               |             
      |               |               |               |             
      |               |               | slashauth:... |             
      |               |               |-------------->|             
      |               |               |               |----+ parse  
      |               |               |               |    | key +  
      |               |               |               |    | token  
      |               |     Query     |               |<---+        
      |<----------------------------------------------|             
      |               |               |               |             
      |               Server IP + port|               |             
      |---------------------------------------------->|             
      |               |               |               |             
                      |      Connect + send token     |             
                      |<------------------------------|             
                  +---|               |               |             
          Verify  |   |               |               |             
          token   |   |               |               |             
                  +-->|               |               |             
                      |        Confirm success        |             
                      |------------------------------>|             
                      |               |               |             
                      |send resources |               |             
                      |-------------->|               |             
                      |               |               |             
```

### magiclink

Magiclink functionality helps wallets get a one-time passwordless link to login to a website, that it previously authenticated to.

1- `Wallet` queries the `DHT` for the current IP and port number for the server's publicKey.
2- `Wallet` connects to the `Server` and requests a magic link.
3- `Server` compares the publicKey the request is coming form, with its internal DB.
4- If the `Server` gants the request, it will respond with a one-time link that `Wallet` can use to redirect the user to an already logged in session in browser.

```
+-----------+   +-----------+               +-----------+                    
|    DHT    |   |  Server   |               |   Wallet  |                    
+-----------+   +-----------+               +-----------+                    
      |               |                           |                          
      |   Announce    |                           |                          
      |<--------------|                           |                          
      |               |                           |                          
      |               |     Query                 |                          
      |<------------------------------------------|                          
      |               |                           |                          
      |               Server IP + port            |                          
      |------------------------------------------>|                          
                      |                           |                          
                      |   Request magiclink       |                          
                      |<--------------------------|                          
                      |                           |                          
                      |One time passwordless link |                          
                      |-------------------------->|                          
                      |                           |                          
```
