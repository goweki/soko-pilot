#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/f0bce2a4a2d1b937366fceb4ffa5aac8d64e089813276f4b7760630d7dbe14dd/contract';
import endContract from '../../snapshots/f0bce2a4a2d1b937366fceb4ffa5aac8d64e089813276f4b7760630d7dbe14dd/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  fn,
  lit,
  primaryKey,
  sql,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createTable({
        schema: 'public',
        table: 'AssistantConfig',
        columns: [
          col('businessRules', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('handoffMessage', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('isActive', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('language', 'text', {
            notNull: true,
            default: lit('en'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('merchantId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('modelName', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('modelProvider', 'text', {
            notNull: true,
            default: lit('meta'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('systemInstructions', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'AssistantRun',
        columns: [
          col('completedAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('conversationId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('errorCode', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('model', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('provider', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('startedAt', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('status', 'text', {
            notNull: true,
            default: lit('started'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('usedFallback', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'AssistantRun_status_check_f6ce814e',
            sql`"status" IN ('started', 'succeeded', 'failed', 'canceled')`,
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'AssistantTool',
        columns: [
          col('assistantId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('isEnabled', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('tool', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'AssistantTool_tool_check_c9d4b227',
            sql`"tool" IN ('search_catalogue', 'create_pending_order', 'get_customer_order')`,
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'AssistantToolExecution',
        columns: [
          col('assistantRunId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('durationMs', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('errorCode', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('proposed'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('tool', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'AssistantToolExecution_status_check_a1414630',
            sql`"status" IN ('proposed', 'completed', 'denied', 'failed')`,
          ),
          checkExpression(
            'AssistantToolExecution_tool_check_c9d4b227',
            sql`"tool" IN ('search_catalogue', 'create_pending_order', 'get_customer_order')`,
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'Conversation',
        columns: [
          col('automationPausedAt', 'timestamptz', {
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('customerId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('lastMessageAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('merchantId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('open'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('whatsappConnectionId', 'text', {
            notNull: true,
            codecRef: { codecId: 'pg/text@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'Conversation_status_check_ae8cad5c',
            sql`"status" IN ('open', 'handoff', 'closed')`,
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'Customer',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('displayName', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('merchantId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('optedOutAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('phoneNumber', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('waId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Merchant',
        columns: [
          col('businessName', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('defaultCurrency', 'text', {
            notNull: true,
            default: lit('KES'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('defaultLanguage', 'text', {
            notNull: true,
            default: lit('en'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('ownerId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('active'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('timeZone', 'text', {
            notNull: true,
            default: lit('Africa/Nairobi'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'Merchant_status_check_697c26d8',
            sql`"status" IN ('active', 'suspended')`,
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'Message',
        columns: [
          col('body', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('contentType', 'text', {
            notNull: true,
            default: lit('text'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('conversationId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('deliveredAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('direction', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('failedAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('mediaId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('providerMessageId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('readAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('sentAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('received'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('whatsappConnectionId', 'text', {
            notNull: true,
            codecRef: { codecId: 'pg/text@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'Message_contentType_check_08a29bf9',
            sql`"contentType" IN ('text', 'image', 'audio', 'video', 'document', 'sticker', 'unknown')`,
          ),
          checkExpression(
            'Message_direction_check_c78a2194',
            sql`"direction" IN ('inbound', 'outbound', 'internal')`,
          ),
          checkExpression(
            'Message_status_check_77f22343',
            sql`"status" IN ('received', 'queued', 'sent', 'delivered', 'read', 'failed')`,
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'Order',
        columns: [
          col('confirmationMessageId', 'text', {
            notNull: true,
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('confirmedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('conversationId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('currency', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('customerId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('idempotencyKey', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('merchantId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('paymentStatus', 'text', {
            notNull: true,
            default: lit('unpaid'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('status', 'text', {
            notNull: true,
            default: lit('pending'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('subtotalMinor', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('totalMinor', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression('Order_paymentStatus_check_0f893001', sql`"paymentStatus" IN ('unpaid')`),
          checkExpression('Order_status_check_763a110a', sql`"status" IN ('pending', 'canceled')`),
          checkExpression('order_subtotal_nonnegative_48dcd881', sql`"subtotalMinor" >= 0`),
          checkExpression('order_total_nonnegative_36d33993', sql`"totalMinor" >= 0`),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'OrderItem',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('lineTotalMinor', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('orderId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('productName', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('productVariantId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('quantity', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('sku', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('unitPriceMinor', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('variantLabel', 'text', { codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression('order_item_price_nonnegative_7fe62227', sql`"unitPriceMinor" >= 0`),
          checkExpression('order_item_quantity_positive_fc510296', sql`"quantity" > 0`),
          checkExpression('order_item_total_nonnegative_522109e7', sql`"lineTotalMinor" >= 0`),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'Plan',
        columns: [
          col('code', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('currency', 'text', {
            notNull: true,
            default: lit('KES'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('isActive', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('monthlyPriceMinor', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'PlanEntitlement',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('feature', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('isEnabled', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('planId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'PlanEntitlement_feature_check_260d8a36',
            sql`"feature" IN ('ai_chatbot')`,
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'Product',
        columns: [
          col('category', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('merchantId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('draft'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'Product_status_check_ee326507',
            sql`"status" IN ('draft', 'active', 'archived')`,
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'ProductVariant',
        columns: [
          col('color', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('currency', 'text', {
            notNull: true,
            default: lit('KES'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('isActive', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('label', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('lowStockThreshold', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('priceMinor', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('productId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('size', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('sku', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('stockQuantity', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression('variant_price_nonnegative_ca42cbb6', sql`"priceMinor" >= 0`),
          checkExpression('variant_stock_nonnegative_63b5ecea', sql`"stockQuantity" >= 0`),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'Subscription',
        columns: [
          col('cancelAtPeriodEnd', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('canceledAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('merchantId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('periodEndsAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('periodStartsAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('planId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('status', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'Subscription_status_check_10ad9396',
            sql`"status" IN ('trialing', 'active', 'past_due', 'canceled', 'expired')`,
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'User',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('email', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('emailVerifiedAt', 'timestamptz', {
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('isActive', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('name', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'WebhookEvent',
        columns: [
          col('attemptCount', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('deduplicationKey', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('lastErrorCode', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('payloadHash', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('processedAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('receivedAt', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('status', 'text', {
            notNull: true,
            default: lit('received'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('whatsappConnectionId', 'text', {
            notNull: true,
            codecRef: { codecId: 'pg/text@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'WebhookEvent_status_check_1660ece3',
            sql`"status" IN ('received', 'processing', 'processed', 'failed')`,
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'WhatsAppConnection',
        columns: [
          col('accessTokenCiphertext', 'text', {
            notNull: true,
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('businessProfileName', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('connectedAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('displayPhoneNumber', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('lastWebhookAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('merchantId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('phoneNumberId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('disconnected'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('tokenExpiresAt', 'timestamptz', {
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('verifyTokenHash', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('wabaId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'WhatsAppConnection_status_check_455760d9',
            sql`"status" IN ('connected', 'disconnected', 'needs_reauthorization')`,
          ),
        ],
      }),
      this.addUnique({
        schema: 'public',
        table: 'AssistantConfig',
        constraint: 'AssistantConfig_merchantId_key',
        columns: ['merchantId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'AssistantTool',
        constraint: 'AssistantTool_assistantId_tool_key',
        columns: ['assistantId', 'tool'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Customer',
        constraint: 'Customer_merchantId_waId_key',
        columns: ['merchantId', 'waId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Merchant',
        constraint: 'Merchant_ownerId_key',
        columns: ['ownerId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Message',
        constraint: 'Message_whatsappConnectionId_providerMessageId_key',
        columns: ['whatsappConnectionId', 'providerMessageId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Order',
        constraint: 'Order_confirmationMessageId_key',
        columns: ['confirmationMessageId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Order',
        constraint: 'Order_merchantId_idempotencyKey_key',
        columns: ['merchantId', 'idempotencyKey'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Plan',
        constraint: 'Plan_code_key',
        columns: ['code'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'PlanEntitlement',
        constraint: 'PlanEntitlement_planId_feature_key',
        columns: ['planId', 'feature'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'ProductVariant',
        constraint: 'ProductVariant_productId_sku_key',
        columns: ['productId', 'sku'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'User',
        constraint: 'User_email_key',
        columns: ['email'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'WebhookEvent',
        constraint: 'WebhookEvent_whatsappConnectionId_deduplicationKey_key',
        columns: ['whatsappConnectionId', 'deduplicationKey'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'WhatsAppConnection',
        constraint: 'WhatsAppConnection_phoneNumberId_key',
        columns: ['phoneNumberId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'WhatsAppConnection',
        constraint: 'WhatsAppConnection_merchantId_wabaId_key',
        columns: ['merchantId', 'wabaId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'AssistantRun',
        index: 'AssistantRun_conversationId_idx_669215a6',
        columns: ['conversationId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'AssistantRun',
        index: 'AssistantRun_conversationId_startedAt_idx_3800d802',
        columns: ['conversationId', 'startedAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'AssistantRun',
        index: 'AssistantRun_provider_model_startedAt_idx_2048378d',
        columns: ['provider', 'model', 'startedAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'AssistantTool',
        index: 'AssistantTool_assistantId_idx_bc333e40',
        columns: ['assistantId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'AssistantToolExecution',
        index: 'AssistantToolExecution_assistantRunId_createdAt_idx_37c1c0ab',
        columns: ['assistantRunId', 'createdAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'AssistantToolExecution',
        index: 'AssistantToolExecution_assistantRunId_idx_34664df0',
        columns: ['assistantRunId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Conversation',
        index: 'Conversation_customerId_createdAt_idx_f10a1fb1',
        columns: ['customerId', 'createdAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Conversation',
        index: 'Conversation_customerId_idx_b2a8a46c',
        columns: ['customerId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Conversation',
        index: 'Conversation_merchantId_idx_ee13c67b',
        columns: ['merchantId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Conversation',
        index: 'Conversation_merchantId_status_lastMessageAt_idx_19937b3e',
        columns: ['merchantId', 'status', 'lastMessageAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Conversation',
        index: 'Conversation_whatsappConnectionId_idx_a94b147d',
        columns: ['whatsappConnectionId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Customer',
        index: 'Customer_merchantId_idx_ee13c67b',
        columns: ['merchantId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Customer',
        index: 'Customer_merchantId_phoneNumber_idx_a691d003',
        columns: ['merchantId', 'phoneNumber'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Merchant',
        index: 'Merchant_status_idx_e98638ab',
        columns: ['status'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Message',
        index: 'Message_conversationId_createdAt_idx_44d4ac61',
        columns: ['conversationId', 'createdAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Message',
        index: 'Message_conversationId_direction_createdAt_idx_75ad7ac4',
        columns: ['conversationId', 'direction', 'createdAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Message',
        index: 'Message_conversationId_idx_669215a6',
        columns: ['conversationId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Message',
        index: 'Message_whatsappConnectionId_idx_a94b147d',
        columns: ['whatsappConnectionId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Order',
        index: 'Order_conversationId_idx_669215a6',
        columns: ['conversationId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Order',
        index: 'Order_customerId_createdAt_idx_f10a1fb1',
        columns: ['customerId', 'createdAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Order',
        index: 'Order_customerId_idx_b2a8a46c',
        columns: ['customerId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Order',
        index: 'Order_merchantId_idx_ee13c67b',
        columns: ['merchantId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Order',
        index: 'Order_merchantId_status_createdAt_idx_52530b35',
        columns: ['merchantId', 'status', 'createdAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'OrderItem',
        index: 'OrderItem_orderId_idx_d284871b',
        columns: ['orderId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'OrderItem',
        index: 'OrderItem_productVariantId_idx_ef742efe',
        columns: ['productVariantId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'PlanEntitlement',
        index: 'PlanEntitlement_planId_idx_5b32079a',
        columns: ['planId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Product',
        index: 'Product_merchantId_category_idx_462aa1d0',
        columns: ['merchantId', 'category'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Product',
        index: 'Product_merchantId_idx_ee13c67b',
        columns: ['merchantId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Product',
        index: 'Product_merchantId_status_idx_e68fb14e',
        columns: ['merchantId', 'status'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'ProductVariant',
        index: 'ProductVariant_productId_idx_5858600a',
        columns: ['productId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'ProductVariant',
        index: 'ProductVariant_productId_isActive_idx_5ca2948a',
        columns: ['productId', 'isActive'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Subscription',
        index: 'Subscription_merchantId_idx_ee13c67b',
        columns: ['merchantId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Subscription',
        index: 'Subscription_merchantId_periodEndsAt_idx_0f91937a',
        columns: ['merchantId', 'periodEndsAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Subscription',
        index: 'Subscription_merchantId_status_idx_e68fb14e',
        columns: ['merchantId', 'status'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Subscription',
        index: 'Subscription_planId_idx_5b32079a',
        columns: ['planId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'WebhookEvent',
        index: 'WebhookEvent_status_receivedAt_idx_bfe57732',
        columns: ['status', 'receivedAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'WebhookEvent',
        index: 'WebhookEvent_whatsappConnectionId_idx_a94b147d',
        columns: ['whatsappConnectionId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'WhatsAppConnection',
        index: 'WhatsAppConnection_merchantId_idx_ee13c67b',
        columns: ['merchantId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'WhatsAppConnection',
        index: 'WhatsAppConnection_merchantId_status_idx_e68fb14e',
        columns: ['merchantId', 'status'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'AssistantConfig',
        foreignKey: {
          name: 'AssistantConfig_merchantId_fkey',
          columns: ['merchantId'],
          references: { schema: 'public', table: 'Merchant', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'AssistantRun',
        foreignKey: {
          name: 'AssistantRun_conversationId_fkey',
          columns: ['conversationId'],
          references: { schema: 'public', table: 'Conversation', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'AssistantTool',
        foreignKey: {
          name: 'AssistantTool_assistantId_fkey',
          columns: ['assistantId'],
          references: { schema: 'public', table: 'AssistantConfig', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'AssistantToolExecution',
        foreignKey: {
          name: 'AssistantToolExecution_assistantRunId_fkey',
          columns: ['assistantRunId'],
          references: { schema: 'public', table: 'AssistantRun', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Conversation',
        foreignKey: {
          name: 'Conversation_merchantId_fkey',
          columns: ['merchantId'],
          references: { schema: 'public', table: 'Merchant', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Conversation',
        foreignKey: {
          name: 'Conversation_customerId_fkey',
          columns: ['customerId'],
          references: { schema: 'public', table: 'Customer', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Conversation',
        foreignKey: {
          name: 'Conversation_whatsappConnectionId_fkey',
          columns: ['whatsappConnectionId'],
          references: { schema: 'public', table: 'WhatsAppConnection', columns: ['id'] },
          onDelete: 'restrict',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Customer',
        foreignKey: {
          name: 'Customer_merchantId_fkey',
          columns: ['merchantId'],
          references: { schema: 'public', table: 'Merchant', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Merchant',
        foreignKey: {
          name: 'Merchant_ownerId_fkey',
          columns: ['ownerId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Message',
        foreignKey: {
          name: 'Message_conversationId_fkey',
          columns: ['conversationId'],
          references: { schema: 'public', table: 'Conversation', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Message',
        foreignKey: {
          name: 'Message_whatsappConnectionId_fkey',
          columns: ['whatsappConnectionId'],
          references: { schema: 'public', table: 'WhatsAppConnection', columns: ['id'] },
          onDelete: 'restrict',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Order',
        foreignKey: {
          name: 'Order_merchantId_fkey',
          columns: ['merchantId'],
          references: { schema: 'public', table: 'Merchant', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Order',
        foreignKey: {
          name: 'Order_customerId_fkey',
          columns: ['customerId'],
          references: { schema: 'public', table: 'Customer', columns: ['id'] },
          onDelete: 'restrict',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Order',
        foreignKey: {
          name: 'Order_conversationId_fkey',
          columns: ['conversationId'],
          references: { schema: 'public', table: 'Conversation', columns: ['id'] },
          onDelete: 'setNull',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Order',
        foreignKey: {
          name: 'Order_confirmationMessageId_fkey',
          columns: ['confirmationMessageId'],
          references: { schema: 'public', table: 'Message', columns: ['id'] },
          onDelete: 'restrict',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'OrderItem',
        foreignKey: {
          name: 'OrderItem_orderId_fkey',
          columns: ['orderId'],
          references: { schema: 'public', table: 'Order', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'OrderItem',
        foreignKey: {
          name: 'OrderItem_productVariantId_fkey',
          columns: ['productVariantId'],
          references: { schema: 'public', table: 'ProductVariant', columns: ['id'] },
          onDelete: 'setNull',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'PlanEntitlement',
        foreignKey: {
          name: 'PlanEntitlement_planId_fkey',
          columns: ['planId'],
          references: { schema: 'public', table: 'Plan', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Product',
        foreignKey: {
          name: 'Product_merchantId_fkey',
          columns: ['merchantId'],
          references: { schema: 'public', table: 'Merchant', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'ProductVariant',
        foreignKey: {
          name: 'ProductVariant_productId_fkey',
          columns: ['productId'],
          references: { schema: 'public', table: 'Product', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Subscription',
        foreignKey: {
          name: 'Subscription_merchantId_fkey',
          columns: ['merchantId'],
          references: { schema: 'public', table: 'Merchant', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Subscription',
        foreignKey: {
          name: 'Subscription_planId_fkey',
          columns: ['planId'],
          references: { schema: 'public', table: 'Plan', columns: ['id'] },
          onDelete: 'restrict',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'WebhookEvent',
        foreignKey: {
          name: 'WebhookEvent_whatsappConnectionId_fkey',
          columns: ['whatsappConnectionId'],
          references: { schema: 'public', table: 'WhatsAppConnection', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'WhatsAppConnection',
        foreignKey: {
          name: 'WhatsAppConnection_merchantId_fkey',
          columns: ['merchantId'],
          references: { schema: 'public', table: 'Merchant', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
