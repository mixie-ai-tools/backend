ALTER TABLE "filings" ADD COLUMN "word_cloud" text;--> statement-breakpoint
ALTER TABLE "filings" DROP COLUMN IF EXISTS "financial_highlights";--> statement-breakpoint
ALTER TABLE "filings" DROP COLUMN IF EXISTS "risks";--> statement-breakpoint
ALTER TABLE "filings" DROP COLUMN IF EXISTS "forward_looking_statements";--> statement-breakpoint
ALTER TABLE "filings" DROP COLUMN IF EXISTS "sentiment_score";