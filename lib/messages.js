import c from 'compact-encoding'
import cstruct from 'compact-encoding-struct'

export const AuthZResponse = cstruct.compile({
  status: c.string,
  message: cstruct.opt(c.string),
  resources: cstruct.opt(cstruct.array(c.string))
})

export const MagicLinkResponse = cstruct.compile({
  url: c.string,
  validUntil: c.uint
})

/**
 * @typedef {{status: "ok" | "error", message?: string, resources?: string[] }} IAuthZResponse
 * @typedef {{url: string, validUntil: number}} IMagicLinkResponse
 */
