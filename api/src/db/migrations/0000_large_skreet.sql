CREATE TYPE "public"."calendar_category" AS ENUM('Consulta', 'Feriados', 'Bloqueio', 'Outros');--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"calendar" "calendar_category" DEFAULT 'Outros' NOT NULL,
	"patientName" text,
	"patientPhone" text,
	"blockReason" text,
	"start" timestamp with time zone NOT NULL,
	"end" timestamp with time zone NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
