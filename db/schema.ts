import { pgTable, text, jsonb, timestamp, integer } from "drizzle-orm/pg-core";

export const corsairIntegrations = pgTable("corsair_integrations", {
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  name: text("name").notNull(),
  config: jsonb("config").notNull().default({}),
  dek: text("dek"),
});

export const corsairAccounts = pgTable("corsair_accounts", {
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  tenantId: text("tenant_id").notNull(),
  integrationId: text("integration_id")
    .notNull()
    .references(() => corsairIntegrations.id),
  config: jsonb("config").notNull().default({}),
  dek: text("dek"),
});

export const corsairEntities = pgTable("corsair_entities", {
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  accountId: text("account_id")
    .notNull()
    .references(() => corsairAccounts.id),
  entityId: text("entity_id").notNull(),
  entityType: text("entity_type").notNull(),
  version: text("version").notNull(),
  data: jsonb("data").notNull().default({}),
});

export const corsairEvents = pgTable("corsair_events", {
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  accountId: text("account_id")
    .notNull()
    .references(() => corsairAccounts.id),
  eventType: text("event_type").notNull(),
  payload: jsonb("payload").notNull().default({}),
  status: text("status"),
});

export const users = pgTable("users", {
  id: text("id").primaryKey(), // Clerk User ID
  email: text("email").notNull(),
  plan: text("plan").notNull().default("free"), // 'free', 'pro', 'ultimate'
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const userUsage = pgTable("user_usage", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  date: text("date").notNull(), // YYYY-MM-DD
  aiChats: integer("ai_chats").notNull().default(0),
  emailSyncs: integer("email_syncs").notNull().default(0),
  calendarSyncs: integer("calendar_syncs").notNull().default(0),
});

export const pendingActions = pgTable("pending_actions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  type: text("type").notNull(), // 'email' | 'calendar'
  payload: jsonb("payload").notNull().default({}), // {to,subject,body} | {summary,start,end}
  status: text("status").notNull().default("pending"), // 'pending' | 'consumed' | 'failed'
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});
