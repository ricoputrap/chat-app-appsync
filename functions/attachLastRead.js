import { runtime, util } from '@aws-appsync/utils'

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

function withRead(chat, lastReadAt) {
  return {
    id: chat.id,
    loc_id: chat.loc_id,
    type: chat.type,
    group_id: chat.group_id,
    created_by: chat.created_by,
    created_at: chat.created_at,
    is_active: chat.is_active,
    last_message_at: chat.last_message_at || 0,
    last_read_at: lastReadAt || 0,
  }
}

export function request(ctx) {
  const user = caller(ctx)
  const chats = ctx.stash.chats || []
  ctx.stash.caller = user
  if (!user) {
    const all = []
    for (const chat of chats) {
      all.push(withRead(chat, 0))
    }
    runtime.earlyReturn(all)
  }
  if (!chats.length) {
    runtime.earlyReturn([])
  }
  return {
    operation: 'Query',
    query: {
      expression: 'user_id = :u',
      expressionValues: util.dynamodb.toMapValues({ ':u': user.user_id }),
    },
  }
}

export function response(ctx) {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type)
  }
  const reads = {}
  const items = (ctx.result && ctx.result.items) || []
  for (const item of items) {
    reads[item.chat_id] = item.last_read_at || 0
  }
  const visible = []
  for (const chat of ctx.stash.chats || []) {
    if (allowed(ctx.stash.caller, chat)) {
      visible.push(withRead(chat, reads[chat.id] || 0))
    }
  }
  return visible
}
