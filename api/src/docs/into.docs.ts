import { FastifySwaggerOptions } from "@fastify/swagger";

export const openApiDocumentation: FastifySwaggerOptions = {
  openapi: {
    openapi: "3.0.3",
    info: {
      title: "Clínica API - Agendamentos & Gestão de Agenda",
      version: "1.0.0",
      description: `
API RESTful desenvolvida para o gerenciamento completo da agenda de uma clínica médica, abrangendo consultas, bloqueios operacionais e integração com feriados nacionais.

---

## 📌 Regras de Negócio & Especificações do Desafio

### 1. Janela de Horário Comercial
- Os agendamentos são permitidos **estritamente entre 08:00 e 18:00**.
- A grade de atendimento trabalha com slots padronizados de **1 hora** de duração.
- Tentativas de agendamento fora do horário comercial retornam erro de validação (\`400 Bad Request\`).

### 2. Integração com Feriados Nacionais (Nager.Date API)
- A API integra-se com a **[Nager.Date Public Holidays API](https://date.nager.at/api/v3/PublicHolidays/{year}/BR)**.
- Feriados nacionais são sincronizados e registrados com a categoria \`Feriados\`, bloqueando o dia por completo.
- É impossível cadastrar qualquer tipo de agendamento ou consulta em datas classificadas como feriado (retornando a indicação do feriado no erro \`400 Bad Request\`).

### 3. Validação de Conflitos / Sobreposição
- O sistema executa checagem de sobreposição de horários no banco de dados.
- Não é permitido criar dois agendamentos que ocupem o mesmo intervalo de tempo (retornando erro \`409 Conflict\`).

### 4. Consulta de Horários Disponíveis
- O endpoint \`GET /appointments/available-slots\` retorna dinamicamente as janelas livres/ocupadas do dia e indica se a data consultada é um feriado.

---

## 🛠️ Tech Stack & Arquitetura
- **Runtime / Framework:** Node.js, Fastify (com Fastify Type Provider Zod)
- **Validação & Schemas:** Zod
- **ORM & Banco de Dados:** Drizzle ORM + PostgreSQL
- **Integrações Externas:** Nager.Date API v3

---

## 🚨 Tabela de Status Codes

| Código | Descrição |
|---|---|
| **200 OK** | Consulta executada com sucesso |
| **201 Created** | Agendamento ou recurso criado com sucesso |
| **400 Bad Request** | Dados inválidos, fora do horário comercial (08h-18h) ou dia de feriado |
| **409 Conflict** | Choque/Sobreposição com outro agendamento existente |
| **500 Internal Error** | Falha interna no servidor ou na integração |

---

## 👨‍💻 Autor

Desenvolvido por **Matheus Pereira da Silva**

- 🔗 **GitHub:** [Matheus1415](https://github.com/Matheus1415)
- 🔗 **LinkedIn:** [Matheus Pereira da Silva](https://www.linkedin.com/in/matheus-pereira-da-silva-298020286/)
`,
      contact: {
        name: "Matheus Pereira da Silva",
        url: "https://github.com/Matheus1415",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },

    servers: [
      {
        url: "http://localhost:3333",
        description: "Servidor de Desenvolvimento Local",
      },
    ],

    tags: [
      {
        name: "Appointments",
        description: "Operações de criação, listagem, remoção e checagem de disponibilidade de horários",
      },
      {
        name: "Holidays",
        description: "Endpoints de sincronização com a API pública de feriados (Nager.Date)",
      },
      {
        name: "Health",
        description: "Verificação da saúde e disponibilidade da aplicação",
      },
    ],
  },
};