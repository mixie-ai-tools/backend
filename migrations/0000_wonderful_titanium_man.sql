CREATE TABLE IF NOT EXISTS "vectors" (
	"id" serial PRIMARY KEY NOT NULL,
	"vector" double precision[],
	"metadata" jsonb,
	"page_content" text,
	"unique_loader_id" varchar(255),
	"source" text
);
