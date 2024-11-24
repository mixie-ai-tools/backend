CREATE TABLE IF NOT EXISTS "vectors" (
	"id" uuid PRIMARY KEY NOT NULL,
	"vector" vector(1536) NOT NULL,
	"content" text NOT NULL,
	"metadata" jsonb NOT NULL
);
