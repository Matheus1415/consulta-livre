import { faker } from "@faker-js/faker";
import { db } from ".";
import { appointments } from "./schema";
import { NagerDateProvider } from "@/services/nager-date.provider";

type NormalCategory = "Consulta" | "Bloqueio" | "Outros";
const normalCategories: NormalCategory[] = ["Consulta", "Bloqueio", "Outros"];

function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

async function seed() {
  console.log("Iniciando o seed do banco de dados...");

  await db.delete(appointments);

  const currentYear = new Date().getFullYear();
  const allAppointments: Array<typeof appointments.$inferInsert> = [];
  const holidayDatesSet = new Set<string>();

  console.log(`Buscando feriados de ${currentYear} na Nager.Date API...`);

  try {
    const holidays = await NagerDateProvider.getPublicHolidays(currentYear, "BR");

    for (const holiday of holidays) {
      const [yearStr, monthStr, dayStr] = holiday.date.split("-");
      const start = new Date(Number(yearStr), Number(monthStr) - 1, Number(dayStr), 0, 0, 0, 0);
      const end = new Date(Number(yearStr), Number(monthStr) - 1, Number(dayStr), 23, 59, 59, 999);

      holidayDatesSet.add(holiday.date);

      allAppointments.push({
        title: holiday.localName,
        calendar: "Feriados",
        blockReason: `Feriado Nacional: ${holiday.localName}`,
        patientName: null,
        patientPhone: null,
        start,
        end,
      });
    }
    console.log(`${holidays.length} feriados oficiais integrados.`);
  } catch (error) {
    console.warn("Não foi possível consultar a API externa de feriados, seguindo sem eles.", error);
  }

  // 2. Gera agendamentos fictícios entre 08:00 e 18:00 (Janela de 60 dias)
  const today = new Date();

  for (let i = -30; i <= 30; i++) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + i);

    const dateKey = toDateKey(targetDate);
    const isWeekend = targetDate.getDay() === 0 || targetDate.getDay() === 6;

    // Ignora dias que são feriados ou finais de semana
    if (holidayDatesSet.has(dateKey) || isWeekend) {
      continue;
    }

    // Quantidade de agendamentos por dia útil (1 a 4)
    const appointmentsCount = faker.number.int({ min: 1, max: 4 });
    const usedHours = new Set<number>();

    for (let j = 0; j < appointmentsCount; j++) {
      // Escolhe um horário entre 8h e 17h (duração de 1h termina no máximo às 18h)
      let startHour = faker.number.int({ min: 8, max: 17 });
      let attempts = 0;

      while (usedHours.has(startHour) && attempts < 10) {
        startHour = faker.number.int({ min: 8, max: 17 });
        attempts++;
      }

      if (usedHours.has(startHour)) continue;
      usedHours.add(startHour);

      const startDate = new Date(
        targetDate.getFullYear(),
        targetDate.getMonth(),
        targetDate.getDate(),
        startHour,
        0,
        0,
        0
      );

      // Duração fixa de 1 hora
      const endDate = new Date(startDate);
      endDate.setHours(startDate.getHours() + 1);

      const calendar = faker.helpers.arrayElement(normalCategories);

      let title = "";
      let patientName: string | null = null;
      let patientPhone: string | null = null;
      let blockReason: string | null = null;

      if (calendar === "Consulta") {
        patientName = faker.person.fullName();
        patientPhone = faker.phone.number();
        title = `Consulta - ${patientName}`;
      } else if (calendar === "Bloqueio") {
        blockReason = faker.helpers.arrayElement([
          "Almoço",
          "Reunião de equipe",
          "Manutenção de equipamentos",
          "Compromisso particular",
        ]);
        title = `Bloqueio: ${blockReason}`;
      } else {
        title = faker.lorem.words(3);
      }

      allAppointments.push({
        title,
        calendar,
        patientName,
        patientPhone,
        blockReason,
        start: startDate,
        end: endDate,
      });
    }
  }

  allAppointments.sort((a, b) => a.start.getTime() - b.start.getTime());

  await db.insert(appointments).values(allAppointments);

  console.log(
    `Banco de dados populado com sucesso! Total de ${allAppointments.length} registros inseridos.`
  );
}

seed()
  .catch((error) => {
    console.error("Erro ao executar seed do banco:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });