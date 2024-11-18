CREATE TABLE IF NOT EXISTS "form_10q_sections" (
	"id" serial PRIMARY KEY NOT NULL,
	"filing_id" integer NOT NULL,
	"section_name" varchar(100) NOT NULL,
	"original_text" text NOT NULL,
	"summary_text" text,
	"word_cloud" jsonb,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "form_10q_sections" ADD CONSTRAINT "form_10q_sections_filing_id_filings_id_fk" FOREIGN KEY ("filing_id") REFERENCES "public"."filings"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
