-- Feature Pack: dashboard-shell
-- Table Views schema migration
-- Creates tables for user-customizable table views
-- Idempotent (safe to re-run with IF NOT EXISTS)

-- Table Views table
CREATE TABLE IF NOT EXISTS "table_views" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" VARCHAR(255) NOT NULL,
  "table_id" VARCHAR(255) NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "is_default" BOOLEAN DEFAULT FALSE NOT NULL,
  "is_system" BOOLEAN DEFAULT FALSE NOT NULL,
  "is_shared" BOOLEAN DEFAULT FALSE NOT NULL,
  "column_visibility" JSONB,
  "sorting" JSONB,
  "description" TEXT,
  "metadata" JSONB,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "last_used_at" TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS "table_views_user_table_idx" ON "table_views" ("user_id", "table_id");
CREATE INDEX IF NOT EXISTS "table_views_user_id_idx" ON "table_views" ("user_id");
CREATE INDEX IF NOT EXISTS "table_views_table_id_idx" ON "table_views" ("table_id");
CREATE INDEX IF NOT EXISTS "table_views_is_default_idx" ON "table_views" ("is_default");
CREATE INDEX IF NOT EXISTS "table_views_is_system_idx" ON "table_views" ("is_system");

-- Table View Filters table
CREATE TABLE IF NOT EXISTS "table_view_filters" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "view_id" UUID NOT NULL REFERENCES "table_views" ("id") ON DELETE CASCADE,
  "field" VARCHAR(255) NOT NULL,
  "operator" VARCHAR(50) NOT NULL,
  "value" TEXT,
  "value_type" VARCHAR(50),
  "metadata" JSONB,
  "sort_order" INTEGER DEFAULT 0 NOT NULL
);

CREATE INDEX IF NOT EXISTS "table_view_filters_view_id_idx" ON "table_view_filters" ("view_id");
CREATE INDEX IF NOT EXISTS "table_view_filters_field_idx" ON "table_view_filters" ("field");

