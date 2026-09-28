import { util } from '@aws-appsync/utils'

export function request(ctx) {
  const item = {
    id: ctx.args.id,
    loc_id: ctx.args.loc_id,
    type: ctx.args.type,
    group_id: ctx.args.group_id,
    created_by: ctx.args.created_by,
    created_at: ctx.args.created_at,
    is_active: ctx.args.is_active,
    last_message_at: ctx.args.last_message_at,
  }
  return {
    operation: 'PutItem',
    key: util.dynamodb.toMapValues({ id: ctx.args.id }),
    attributeValues: util.dynamodb.toMapValues(item),
  }
}

export function response(ctx) {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type)
  }
  return {
    id: ctx.args.id,
    loc_id: ctx.args.loc_id,
    type: ctx.args.type,
    group_id: ctx.args.group_id,
    created_by: ctx.args.created_by,
    created_at: ctx.args.created_at,
    is_active: ctx.args.is_active,
    last_message_at: ctx.args.last_message_at,
    last_read_at: 0,
  }
}
