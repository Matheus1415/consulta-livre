import Fastify from "fastify";
import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import scalarApiReference from "@scalar/fastify-api-reference";

import {
  serializerCompiler,
  validatorCompiler,
  jsonSchemaTransform,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { env } from "./env";
import { openApiDocumentation } from "./docs/into.docs";
import { createAppointment } from "./routes/create-appointment";
import { getAppointments } from "./routes/get-appointments";
import { updateAppointment } from "./routes/update-appointment";
import { deleteAppointment } from "./routes/delete-appointment";
import { getAvailableSlots } from "./routes/available-appointment";
import { syncHolidays } from "./routes/sync-holidays";

const app = Fastify().withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(cors, {
  origin: true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
});

app.register(swagger, {
  ...openApiDocumentation,
  transform: jsonSchemaTransform,
});

app.register(scalarApiReference, {
  routePrefix: "/docs",
});

app.register(getAppointments);
app.register(getAvailableSlots);
app.register(createAppointment);
app.register(syncHolidays);
app.register(updateAppointment);
app.register(deleteAppointment);

app.listen({ port: env.PORT, host: "0.0.0.0" }).then(() => {
  console.log("HTTP server running on http://localhost:3333");
  console.log("DOCS available at http://localhost:3333/docs");
});
