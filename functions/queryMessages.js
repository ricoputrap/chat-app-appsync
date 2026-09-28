import { util } from '@aws-appsync/utils'

export function request(ctx) {
  const req = {
    operation: 'Query',
    query: {
      expression: 'chat_id = :id',
      expressionValues: util.dynamodb.toMapValues({ ':id': ctx.args.chat_id }),
    },
    scanIndexForward: false,
    limit: ctx.args.limit || 50,
  }
  if (ctx.args.nextToken) {
    req.nextToken = ctx.args.nextToken
  }
  return req
}

export function response(ctx) {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type)
  }
  return {
    messages: ctx.result.items || [],
    nextToken: ctx.result.nextToken || null,
  }
}
