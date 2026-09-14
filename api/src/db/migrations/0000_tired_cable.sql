CREATE TABLE "webhooks" (
	"id" text PRIMARY KEY NOT NULL,
	"method" text NOT NULL,
	"pathname" text NOT NULL,
	"ip" text NOT NULL,
	"contentType" text,
	"contentLength" integer,
	"queryParams" jsonb,
	"headers" jsonb NOT NULL,
	"body" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
