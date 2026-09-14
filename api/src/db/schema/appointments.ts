import { pgTable, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";

export const calendarCategoryEnum = pgEnum("calendar_category", [
  "Consulta",
  "Feriados",
  "Bloqueio",
  "Outros",
]);

export const appointments = pgTable("appointments", {
  id: text()
    .primaryKey()
    .$defaultFn(() => uuidv7()),

  title: text().notNull(),
  calendar: calendarCategoryEnum().notNull().default("Outros"),
  patientName: text(),
  patientPhone: text(),
  blockReason: text(),

  start: timestamp({ withTimezone: true }).notNull(),
  end: timestamp({ withTimezone: true }).notNull(),

  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});