import { defineConfig } from "@rcmade/hono-docs";

export default defineConfig({
  tsConfigPath: "./tsconfig.json",
  openApi: {
    openapi: "3.0.0",
    info: { title: "KSITM API", version: "1.0.0" },
    servers: [{ url: "http://localhost:3000" }],
  },
  outputs: {
    openApiJson: "./openapi/openapi.json",
  },
  apis: [
    {
      name: "Auth Routes",
      apiPrefix: "/auth",
      appTypePath: "src/docs-types/authRoutes.ts",
      api: [],
    },
    {
      name: "Requests",
      apiPrefix: "/requests",
      appTypePath: "src/docs-types/requestRoutes.ts",
      api: [],
    },
    {
      name: "Payments",
      apiPrefix: "/payments",
      appTypePath: "src/docs-types/paymentRoutes.ts",
      api: [],
    },
    {
      name: "Admin",
      apiPrefix: "/admin",
      appTypePath: "src/docs-types/adminRoutes.ts",
      api: [],
    },
    {
      name: "Officer",
      apiPrefix: "/officer",
      appTypePath: "src/docs-types/officerRoutes.ts",
      api: [],
    },
  ],
});
