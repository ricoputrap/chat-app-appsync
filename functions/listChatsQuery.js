import { util } from '@aws-appsync/utils'

export function request(ctx) {
  return {
    operation: 'Query',
    index: 'loc-index',
    query: {
      expression: 'loc_id = :loc',
      expressionValues: util.dynamodb.toMapValues({ ':loc': ctx.args.loc_id }),
    },
  }
}

export function response(ctx) {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type)
  }
  ctx.stash.chats = ctx.result.items || []
  return ctx.stash.chats
}
