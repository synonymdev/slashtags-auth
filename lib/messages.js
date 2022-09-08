import c from 'compact-encoding'
import cstruct from 'compact-encoding-struct'

export const AuthZResponse = cstruct.compile({
  status: c.string,
  message: cstruct.opt(c.string)
})

/**
 * @typedef {{status: "ok" : "error", message: string}} AuthZResponse
 */
