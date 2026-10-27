import "dotenv/config";
import { definePrismaConfig } from "@prisma/cli-engine";
import { defineConfig as ormConfig } from "@prisma/orm-postgres/config";

export default definePrismaConfig({
  orm: ormConfig({
    contract: "./src/prisma/contract.prisma",
    db: {
      connection: process.env["DATABASE_URL"]!,
    },
    migrations: {
      path: "src/lib/prisma/migrations",
      seed: "tsx src/lib/prisma/seed",
    },
  }),
});
