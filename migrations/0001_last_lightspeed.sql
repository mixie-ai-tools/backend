ALTER TABLE "filings" ADD COLUMN "summary" text ;--> statement-breakpoint
ALTER TABLE "filings" ADD COLUMN "financial_highlights" text ;--> statement-breakpoint
ALTER TABLE "filings" ADD COLUMN "risks" text ;--> statement-breakpoint
ALTER TABLE "filings" ADD COLUMN "forward_looking_statements" text ;--> statement-breakpoint
ALTER TABLE "filings" ADD COLUMN "sentiment_score" double precision ;--> statement-breakpoint
ALTER TABLE "filings" ADD COLUMN "created_at" timestamp with time zone DEFAULT now();