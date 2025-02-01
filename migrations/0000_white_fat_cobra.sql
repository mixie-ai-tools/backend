CREATE TABLE IF NOT EXISTS "image_variant" (
	"id" uuid PRIMARY KEY NOT NULL,
	"storyboard_id" uuid NOT NULL,
	"aspectRatio" text,
	"url" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "original_image" (
	"id" uuid PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"storyboard_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "storyboard_steps" (
	"id" uuid PRIMARY KEY NOT NULL,
	"storyboard_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "storyboards" (
	"id" uuid PRIMARY KEY NOT NULL,
	"step_order" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"title" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "image_variant" ADD CONSTRAINT "image_variant_storyboard_id_original_image_id_fk" FOREIGN KEY ("storyboard_id") REFERENCES "public"."original_image"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "original_image" ADD CONSTRAINT "original_image_storyboard_id_storyboard_steps_id_fk" FOREIGN KEY ("storyboard_id") REFERENCES "public"."storyboard_steps"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "storyboard_steps" ADD CONSTRAINT "storyboard_steps_storyboard_id_storyboards_id_fk" FOREIGN KEY ("storyboard_id") REFERENCES "public"."storyboards"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
