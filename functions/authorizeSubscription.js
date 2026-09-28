import { util } from '@aws-appsync/utils'

function caller(ctx) {
  const identity = ctx.identity || {}
  const claims = identity.claims || identity.resolverContext
  if (!claims || claims.user_id == null || claims.user_id === '') {
    return null
  }
  const userID = +claims.user_id
  if (userID !== userID) {
    return null
  }
  let groups = claims.group_ids || []
  if (typeof groups === 'string') {
    groups = groups.length ? JSON.parse(groups) : []
  }
  return { user_id: userID, group_ids: groups }
}

function allowed(user, chat) {
  if (chat.type === 'general') {
    return true
  }
  const groups = user.group_ids || []
  for (const id of groups) {
    if (+id === +chat.group_id) {
      return true
    }
  }
  return false
}

export function request(ctx) {
  return {
    operation: 'GetItem',
    key: util.dynamodb.toMapValues({ id: ctx.args.chat_id }),
  }
}

export function response(ctx) {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type)
  }
  const user = caller(ctx)
  if (!ctx.result || !user || !allowed(user, ctx.result)) {
    util.unauthorized()
  }
  return null
}
