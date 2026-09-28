import { util } from '@aws-appsync/utils'

export function request(ctx) {
  return {
    operation: 'UpdateItem',
    key: util.dynamodb.toMapValues({ id: ctx.args.chat_id }),
    update: {
      expression: 'SET last_message_at = :ts',
      expressionValues: util.dynamodb.toMapValues({ ':ts': ctx.args.created_at }),
    },
    condition: {
      expression: 'attribute_exists(id)',
    },
  }
}

export function response(ctx) {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type)
  }
  return ctx.stash.message
}
