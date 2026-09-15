import { db } from "@/db";
import { appointments } from "@/db/schema";
import { NagerDateProvider } from "@/services/nager-date.provider";
import { and, eq } from "drizzle-orm";

export interface SyncHolidaysResponse {
  totalFetched: number;
  totalCreated: number;
  totalSkipped: number;
}

export async function syncHolidaysUseCase(
  year: number,
): Promise<SyncHolidaysResponse> {
  const holidays = await NagerDateProvider.getPublicHolidays(year, "BR");

  let totalCreated = 0;
  let totalSkipped = 0;

  for (const holiday of holidays) {
    const start = new Date(`${holiday.date}T00:00:00.000Z`);
    const end = new Date(`${holiday.date}T23:59:59.999Z`);

    const [existingHoliday] = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.calendar, "Feriados"),
          eq(appointments.start, start),
        ),
      )
      .limit(1);

    if (!existingHoliday) {
      await db.insert(appointments).values({
        title: holiday.localName,
        calendar: "Feriados",
        blockReason: `Feriado Nacional: ${holiday.localName}`,
        start,
        end,
      });

      totalCreated++;
    } else {
      totalSkipped++;
    }
  }

  return {
    totalFetched: holidays.length,
    totalCreated,
    totalSkipped,
  };
}
