# Consulta Livre

Sistema de gestão de agenda para uma clínica, desenvolvido como teste técnico full stack.

A aplicação permite visualizar agendamentos em calendário mensal, semanal e diário, criar consultas e bloqueios, editar eventos, consultar horários disponíveis e sincronizar feriados nacionais. O backend concentra as regras de negócio e o frontend oferece uma interface clara para operação da agenda.

## Imagens do sistema

<div align="center" style="display: flex; flex-wrap: wrap; justify-content: center; gap: 10px;">
  <img width="48%" alt="calendar" src="https://github.com/user-attachments/assets/27403bce-5ec8-4e95-9311-bf1b4d286d5e" />
  <img width="48%" alt="add-appointment" src="https://github.com/user-attachments/assets/ed4b5d05-2554-45cd-bc52-62a60c582d4c" />
  <img width="48%" alt="edit-appointment" src="https://github.com/user-attachments/assets/410addbb-ab61-4210-b109-dbeb8d985074" />
</div>

## Funcionalidades

- Calendário interativo com visualizações mensal, semanal e diária.
- Navegação por mês e ano, com carregamento dos agendamentos correspondentes.
- Filtros por categoria: consultas, feriados, bloqueios e outros eventos.
- Criação de agendamentos com seleção de data e horários disponíveis.
- Edição e exclusão de agendamentos.
- Consulta de disponibilidade por data através de endpoint dedicado.
- Sincronização de feriados nacionais do Brasil usando a API Nager.Date.
- Validação de conflitos e sobreposição de horários no backend.
- Notificações de sucesso e erro na interface.
- Documentação interativa da API com OpenAPI e Scalar.

## Decisões técnicas

O backend é a fonte de verdade para disponibilidade e regras de agendamento. O frontend consulta `GET /appointments/available-slots` em vez de inferir sozinho quais horários estão livres.

Regras principais:

- Horário de atendimento entre 08:00 e 18:00.
- Slots de uma hora.
- Não é permitido sobrepor agendamentos.
- Feriados bloqueiam o dia inteiro.
- Fins de semana, datas inválidas e horários fora da janela comercial são rejeitados.
- Feriados sincronizados não podem ser removidos.

## Stack

**Frontend:** React 19, TypeScript, Vite, FullCalendar, Tailwind CSS, Radix UI, React Hook Form, SWR, Axios e date-fns.

**Backend:** Node.js, Fastify, Zod, Drizzle ORM, PostgreSQL, OpenAPI/Scalar e Nager.Date.

## Estrutura

```text
.
├── api/
│   ├── src/routes/       # Endpoints HTTP
│   ├── src/use-cases/    # Casos de uso
│   ├── src/services/     # Regras e integrações externas
│   ├── src/db/           # Schema, migrações e seed
│   └── docker-compose.yml
└── client/
    └── src/              # Interface e integração HTTP
```

## Pré-requisitos

- Node.js 20 ou superior
- npm
- Docker e Docker Compose

## Instalação

```bash
git clone https://github.com/Matheus1415/consulta-livre.git
cd consulta-livre

cd api
npm install

cd ../client
npm install
```

### Backend

Crie `api/.env`:

```env
NODE_ENV=development
PORT=3333
DATABASE_URL=postgresql://docker:docker@localhost:5432/clinica_db
```

Suba o PostgreSQL, aplique as migrações e, opcionalmente, crie dados de demonstração:

```bash
cd api
docker compose up -d
npm run db:migrate
npm run db:seed
```

O seed limpa os registros existentes, sincroniza os feriados do ano atual e cria agendamentos fictícios para facilitar a avaliação.

### Frontend

Crie `client/.env`:

```env
VITE_API_URL=http://localhost:3333
```

## Execução

Abra dois terminais:

```bash
# Terminal 1
cd api
npm run dev
```

```bash
# Terminal 2
cd client
npm run dev
```

Acesse o endereço informado pelo Vite, normalmente `http://localhost:5173`.

## Documentação da API

Com a API em execução:

- [Documentação Scalar](http://localhost:3333/docs)

### Endpoints principais

| Método | Rota | Objetivo |
|---|---|---|
| `GET` | `/appointments?month=3&year=2026` | Lista agendamentos do mês |
| `GET` | `/appointments/available-slots?date=2026-03-25` | Consulta horários livres e ocupados |
| `POST` | `/appointments` | Cria um agendamento |
| `PUT` | `/appointments/:id` | Atualiza um agendamento |
| `DELETE` | `/appointments/:id` | Remove um agendamento |
| `POST` | `/appointments/sync-holidays` | Sincroniza feriados de um ano |

Exemplo de criação:

```bash
curl -X POST http://localhost:3333/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Consulta - Maria Silva",
    "calendar": "Consulta",
    "patientName": "Maria Silva",
    "patientPhone": "(85) 99999-9999",
    "blockReason": null,
    "start": "2026-03-25T10:00:00.000Z",
    "end": "2026-03-25T11:00:00.000Z"
  }'
```

## Roteiro de avaliação

1. Suba o banco, execute as migrações e rode o seed.
2. Inicie API e frontend.
3. Navegue para outro mês e confirme que os agendamentos são recarregados sem retornar ao mês anterior.
4. Crie um agendamento e verifique que os horários vêm do endpoint de disponibilidade.
5. Confirme que horários ocupados ficam bloqueados.
6. Edite um evento e valide a notificação de sucesso.
7. Tente criar um conflito, utilizar um feriado ou agendar fora de 08:00–18:00.
8. Consulte `/docs` para explorar os contratos e respostas da API.

## Scripts

### API

```bash
npm run dev          # desenvolvimento com reload
npm run build        # compila TypeScript
npm run db:migrate   # aplica migrações
npm run db:generate  # gera migrações Drizzle
npm run db:studio    # abre o Drizzle Studio
npm run db:seed      # recria dados de demonstração
```

### Frontend

```bash
npm run dev          # servidor Vite
```

## Autor

Desenvolvido por **Matheus Pereira da Silva**.

- GitHub: [Matheus1415](https://github.com/Matheus1415)
- LinkedIn: [Matheus Pereira da Silva](https://www.linkedin.com/in/matheus-pereira-da-silva-298020286/)
