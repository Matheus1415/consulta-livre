
export interface NagerPublicHoliday {
  date: string; 
  localName: string;
  name: string; 
  countryCode: string; 
  fixed: boolean;
  global: boolean;
  counties: string[] | null;
  launchYear: number | null;
  types: string[]; 
}

export class NagerDateProvider {
  private static readonly BASE_URL = "https://date.nager.at/api/v3";

  static async getPublicHolidays(
    year: number,
    countryCode = "BR"
  ): Promise<NagerPublicHoliday[]> {
    const url = `${this.BASE_URL}/PublicHolidays/${year}/${countryCode}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Erro HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = (await response.json()) as NagerPublicHoliday[];
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `Falha ao integrar com Nager.Date API (${url}): ${error.message}`
        );
      }
      throw new Error("Erro desconhecido na integração com Nager.Date API.");
    }
  }

  static async isHoliday(
    dateStr: string,
    countryCode = "BR"
  ): Promise<{ isHoliday: boolean; holidayDetails?: NagerPublicHoliday }> {
    const year = new Date(dateStr).getFullYear();

    if (isNaN(year)) {
      throw new Error("Data inválida. Use o formato YYYY-MM-DD.");
    }

    const holidays = await this.getPublicHolidays(year, countryCode);
    const holidayDetails = holidays.find((h) => h.date === dateStr);

    return {
      isHoliday: Boolean(holidayDetails),
      holidayDetails,
    };
  }
}