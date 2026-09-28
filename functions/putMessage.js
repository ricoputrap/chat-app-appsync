import { util } from '@aws-appsync/utils'

export function request(ctx) {
  const item = {
    chat_id: ctx.args.chat_id,
    sk: ctx.args.sk,
    msg: ctx.args.msg,
    sender_id: ctx.args.sender_id,
    created_at: ctx.args.created_at,
  }
  return {
    operation: 'PutItem',
    key: util.dynamodb.toMapValues({
      chat_id: ctx.args.chat_id,
      sk: ctx.args.sk,
    }),
    attributeValues: util.dynamodb.toMapValues(item),
  }
}

export function response(ctx) {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type)
  }
  ctx.stash.message = {
    chat_id: ctx.args.chat_id,
    sk: ctx.args.sk,
    msg: ctx.args.msg,
    sender_id: ctx.args.sender_id,
    created_at: ctx.args.created_at,
  }
  return ctx.stash.message
}
