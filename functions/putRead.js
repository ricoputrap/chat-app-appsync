import { util } from '@aws-appsync/utils'

export function request(ctx) {
  const item = {
    user_id: ctx.args.user_id,
    chat_id: ctx.args.chat_id,
    last_read_at: ctx.args.last_read_at,
  }
  return {
    operation: 'PutItem',
    key: util.dynamodb.toMapValues({
      user_id: ctx.args.user_id,
      chat_id: ctx.args.chat_id,
    }),
    attributeValues: util.dynamodb.toMapValues(item),
  }
}

export function response(ctx) {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type)
  }
  return {
    user_id: ctx.args.user_id,
    chat_id: ctx.args.chat_id,
    last_read_at: ctx.args.last_read_at,
  }
}
