import { faker } from "@faker-js/faker"
import { db } from "."
import { webhooks } from "./schema"

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

const httpMethods: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"]

const stripeEvents = [
  "charge.succeeded",
  "charge.failed",
  "payment_intent.succeeded",
  "invoice.paid",
  "customer.created",
  "customer.deleted",
  "customer.subscription.created",
  "checkout.session.completed",
]

function generateWebhook() {
  const method = faker.helpers.arrayElement(httpMethods)
  const eventType = faker.helpers.arrayElement(stripeEvents)

  const pathname = faker.helpers.arrayElement([
    "/webhooks/stripe",
    "/api/payments",
    "/api/customers",
    "/api/invoices",
  ])

  const ip = faker.internet.ipv4()

  // Status baseado no método
  const statusMap: Record<HttpMethod, number[]> = {
    GET: [200, 200, 304, 404],
    POST: [200, 201, 400, 500],
    PUT: [200, 204, 400],
    PATCH: [200, 204, 400],
    DELETE: [200, 204, 404],
  }

  const statusCode = faker.helpers.arrayElement(statusMap[method])

  // Query params apenas para GET
  const queryParams =
    method === "GET"
      ? {
          page: faker.number.int({ min: 1, max: 5 }),
          limit: faker.helpers.arrayElement([10, 20, 50]),
          search: faker.word.sample(),
        }
      : null

  // Body apenas para métodos que enviam dados
  const bodyObject =
    method !== "GET" && method !== "DELETE"
      ? {
          id: `evt_${faker.string.alphanumeric(24)}`,
          type: eventType,
          created: Date.now(),
          data: {
            amount: faker.number.int({ min: 1000, max: 50000 }),
            currency: faker.helpers.arrayElement(["usd", "eur", "brl"]),
            customer: `cus_${faker.string.alphanumeric(14)}`,
            description: faker.company.catchPhrase(),
          },
        }
      : null

  const bodyString = bodyObject
    ? JSON.stringify(bodyObject, null, 2)
    : null

  const headers = {
    "content-type": "application/json",
    "user-agent": faker.internet.userAgent(),
    "accept": "*/*",
  }

  return {
    method,
    pathname,
    ip,
    statusCode,
    contentType: "application/json",
    contentLength: bodyString
      ? Buffer.byteLength(bodyString)
      : 0,
    queryParams,
    headers,
    body: bodyString,
    createdAt: faker.date.recent({ days: 30 }),
  }
}

async function seed() {
  console.log("🌱 Seeding database...")

  await db.delete(webhooks)

  const webhooksData = Array.from({ length: 80 }, () =>
    generateWebhook()
  )

  webhooksData.sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
  )

  await db.insert(webhooks).values(webhooksData)

  console.log("✅ Database seeded successfully with 80 mixed webhooks!")
}

seed()
  .catch((error) => {
    console.error("❌ Error seeding database:", error)
    process.exit(1)
  })
  .finally(() => {
    process.exit(0)
  })
