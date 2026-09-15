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
  year: number
): Promise<SyncHolidaysResponse> {
  const holidays = await NagerDateProvider.getPublicHolidays(year, "BR");

  let totalCreated = 0;
  let totalSkipped = 0;

  for (const holiday of holidays) {
    // Separa ano, mês e dia para construir a data no horário local (evita timezone shift UTC-3)
    const [yearStr, monthStr, dayStr] = holiday.date.split("-");
    const yearNum = Number(yearStr);
    const monthNum = Number(monthStr) - 1;
    const dayNum = Number(dayStr);

    const start = new Date(yearNum, monthNum, dayNum, 0, 0, 0, 0);
    const end = new Date(yearNum, monthNum, dayNum, 23, 59, 59, 999);

    // Checa se o feriado já existe no banco para evitar duplicatas
    const [existingHoliday] = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.calendar, "Feriados"),
          eq(appointments.start, start)
        )
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