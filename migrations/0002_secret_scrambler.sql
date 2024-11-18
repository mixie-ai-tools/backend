ALTER TABLE "filings" ALTER COLUMN "summary" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "filings" ALTER COLUMN "financial_highlights" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "filings" ALTER COLUMN "risks" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "filings" ALTER COLUMN "forward_looking_statements" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "filings" ALTER COLUMN "sentiment_score" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "filings" ADD COLUMN "original_text" text;