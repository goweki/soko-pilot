#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/5c1ed61ccdd860c7987a2fb260a2df6fd176137b724981e5c256a66fb4819f08/contract';
import endContract from '../../snapshots/5c1ed61ccdd860c7987a2fb260a2df6fd176137b724981e5c256a66fb4819f08/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/f0bce2a4a2d1b937366fceb4ffa5aac8d64e089813276f4b7760630d7dbe14dd/contract';
import startContract from '../../snapshots/f0bce2a4a2d1b937366fceb4ffa5aac8d64e089813276f4b7760630d7dbe14dd/contract.json' with { type: 'json' };
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

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'SalesRecoveryConfig',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('frequencyCapDays', 'int4', {
            notNull: true,
            default: lit(7),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('inactivityMinutes', 'int4', {
            notNull: true,
            default: lit(240),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('isEnabled', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('merchantId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'recovery_frequency_valid_b94a91d0',
            sql`"frequencyCapDays" >= 1 AND "frequencyCapDays" <= 90`,
          ),
          checkExpression(
            'recovery_inactivity_valid_d2e73fe3',
            sql`"inactivityMinutes" >= 60 AND "inactivityMinutes" <= 1380`,
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'SalesRecoveryOpportunity',
        columns: [
          col('conversationId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('customerId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('evidence', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('failureCode', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('idempotencyKey', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('lastOutboundMessageId', 'text', {
            notNull: true,
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('merchantId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('providerMessageId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('reason', 'text', {
            notNull: true,
            default: lit('unknown'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('reviewedAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('sentAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('pending'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('suggestedMessage', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('triggerMessageId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'SalesRecoveryOpportunity_reason_check_a3e3e1b6',
            sql`"reason" IN ('buying_intent', 'price_concern', 'unavailable_item', 'undecided', 'unanswered_question', 'unknown')`,
          ),
          checkExpression(
            'SalesRecoveryOpportunity_status_check_87bd62f0',
            sql`"status" IN ('pending', 'approved', 'rejected', 'dismissed', 'sent', 'failed')`,
          ),
        ],
      }),
      this.addUnique({
        schema: 'public',
        table: 'SalesRecoveryConfig',
        constraint: 'SalesRecoveryConfig_merchantId_key',
        columns: ['merchantId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'SalesRecoveryOpportunity',
        constraint: 'SalesRecoveryOpportunity_merchantId_idempotencyKey_key',
        columns: ['merchantId', 'idempotencyKey'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'SalesRecoveryOpportunity',
        constraint: 'SalesRecoveryOpportunity_conversationId_triggerMessageId_key',
        columns: ['conversationId', 'triggerMessageId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'SalesRecoveryOpportunity',
        index: 'SalesRecoveryOpportunity_conversationId_idx_669215a6',
        columns: ['conversationId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'SalesRecoveryOpportunity',
        index: 'SalesRecoveryOpportunity_customerId_idx_b2a8a46c',
        columns: ['customerId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'SalesRecoveryOpportunity',
        index: 'SalesRecoveryOpportunity_merchantId_idx_ee13c67b',
        columns: ['merchantId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'SalesRecoveryOpportunity',
        index: 'sro_merchant_status_created_52530b35',
        columns: ['merchantId', 'status', 'createdAt'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'SalesRecoveryConfig',
        foreignKey: {
          name: 'SalesRecoveryConfig_merchantId_fkey',
          columns: ['merchantId'],
          references: { schema: 'public', table: 'Merchant', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'SalesRecoveryOpportunity',
        foreignKey: {
          name: 'SalesRecoveryOpportunity_merchantId_fkey',
          columns: ['merchantId'],
          references: { schema: 'public', table: 'Merchant', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'SalesRecoveryOpportunity',
        foreignKey: {
          name: 'SalesRecoveryOpportunity_conversationId_fkey',
          columns: ['conversationId'],
          references: { schema: 'public', table: 'Conversation', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'SalesRecoveryOpportunity',
        foreignKey: {
          name: 'SalesRecoveryOpportunity_customerId_fkey',
          columns: ['customerId'],
          references: { schema: 'public', table: 'Customer', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
