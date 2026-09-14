import { FastifySwaggerOptions } from "@fastify/swagger";

export const openApiDocumentation: FastifySwaggerOptions = {
  openapi: {
    openapi: "3.0.3",
    info: {
      title: "Clínica API & Agendamentos e Gestão",
      version: "1.0.0",
      description: `
API REST para gerenciamento da agenda da clínica, consultas, pacientes, feriados e bloqueios de horário.

Esta API permite:

- 📅 Criar, atualizar e listar agendamentos (Consultas, Feriados, Bloqueios e Outros)
- 👤 Gerenciar informações de pacientes e telefones
- 🕒 Controle de horários com suporte a timezone e dias inteiros
- 📄 Paginação e ordenação cronológica baseada em UUID v7

---

## 🌍 Base URL

\`\`\`
http://localhost:3333
\`\`\`

---

## 📦 Paginação e Filtros

A listagem de agendamentos suporta filtros por categoria e intervalo de datas.

---

## 📄 Formato de Resposta

Todas as respostas são retornadas em **JSON**.

Datas são retornadas no padrão **ISO 8601 (UTC)**.

---

## 🚨 Status Codes

- **200** — Requisição bem-sucedida  
- **201** — Recurso criado com sucesso  
- **400** — Erro de validação  
- **404** — Recurso não encontrado  
- **500** — Erro interno do servidor  

---

## 🔐 Autenticação

Atualmente esta API gerencia o acesso de forma interna/protegida.

---

## 👨‍💻 Sobre o Autor

Este projeto foi desenvolvido por **Matheus Pereira da Silva**.

- 🧠 Foco em Backend & Arquitetura
- ⚡ Node.js, Fastify, PostgreSQL, Drizzle ORM
- 📦 APIs REST modernas e escaláveis

🔗 GitHub: https://github.com/Matheus1415  
🔗 LinkedIn: https://www.linkedin.com/in/matheus-pereira-da-silva-298020286/

---
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
        description: "Local development",
      },
      {
        url: "https://api.seudominio.com",
        description: "Production",
      },
    ],

    tags: [
      {
        name: "Appointments",
        description: "Operations related to medical appointments, holidays, and schedule blocks",
      },
      {
        name: "Health",
        description: "Application health check endpoints",
      },
    ],
  },
};