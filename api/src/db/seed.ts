import { faker } from "@faker-js/faker";
import { db } from ".";
import { appointments } from "./schema";

type CalendarCategory = "Consulta" | "Feriados" | "Bloqueio" | "Outros";

const categories: CalendarCategory[] = [
  "Consulta",
  "Feriados",
  "Bloqueio",
  "Outros",
];

function generateAppointment() {
  const calendar = faker.helpers.arrayElement(categories);

  let title = "";
  let patientName: string | null = null;
  let patientPhone: string | null = null;
  let blockReason: string | null = null;

  const startDate = faker.date.recent({ days: 15 });
  const endDate = new Date(startDate);

  if (calendar === "Consulta") {
    patientName = faker.person.fullName();
    patientPhone = faker.phone.number();
    title = `Consulta - ${patientName}`;
    // Duração padrão de 30 a 60 minutos para consultas
    endDate.setMinutes(
      startDate.getMinutes() + faker.helpers.arrayElement([30, 45, 60]),
    );
  } else if (calendar === "Bloqueio") {
    blockReason = faker.helpers.arrayElement([
      "Almoço",
      "Reunião de equipe",
      "Manutenção de equipamentos",
      "Compromisso particular",
    ]);
    title = `Bloqueio: ${blockReason}`;
    endDate.setHours(
      startDate.getHours() + faker.number.int({ min: 1, max: 2 }),
    );
  } else if (calendar === "Feriados") {
    title = faker.helpers.arrayElement([
      "Feriado Nacional",
      "Confraternização Universal",
      "Tiradentes",
      "Independência do Brasil",
    ]);
    // Feriado de dia inteiro (00:00 até 23:59)
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
  } else {
    title = faker.lorem.words(3);
    endDate.setHours(startDate.getHours() + 1);
  }

  return {
    title,
    calendar,
    patientName,
    patientPhone,
    blockReason,
    start: startDate,
    end: endDate,
  };
}

async function seed() {
  console.log("Seeding database with appointments...");

  await db.delete(appointments);

  const appointmentsData = Array.from({ length: 40 }, () =>
    generateAppointment(),
  );

  appointmentsData.sort((a, b) => a.start.getTime() - b.start.getTime());

  await db.insert(appointments).values(appointmentsData);

  console.log("Database seeded successfully with 40 clinic appointments!");
}

seed()
  .catch((error) => {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
