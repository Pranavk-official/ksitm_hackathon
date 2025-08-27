import { PrismaClient, Prisma } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();

function makeSalt(size = 16) {
  return randomBytes(size).toString("hex");
}

function hashPassword(password: string, salt: string) {
  // store a bcrypt hash of password+salt so the salt is separate in DB as requested
  return bcrypt.hashSync(password + salt, 10);
}

async function main() {
  console.log("Seeding database...");

  // Clean up existing seeded data (safe for development only)
  await prisma.auditLog.deleteMany();
  await prisma.serviceRequest.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();

  // Roles
  const adminRole = await prisma.role.create({
    data: { name: "ADMIN" },
  });

  const userRole = await prisma.role.create({
    data: { name: "USER" },
  });

  // Users
  const usersData = [
    {
      name: "Alice Admin",
      email: "admin@example.com",
      mobile: "9998887777",
      password: "AdminPass123!",
      roleId: adminRole.id,
    },
    {
      name: "Bob Citizen",
      email: "bob@example.com",
      mobile: "9123456780",
      password: "UserPass456$",
      roleId: userRole.id,
    },
  ];

  const createdUsers: { id: string; email: string }[] = [];

  for (const u of usersData) {
    const salt = makeSalt();
    const passwordHash = hashPassword(u.password, salt);

    const created = await prisma.user.create({
      data: {
        name: u.name,
        email: u.email,
        mobile: u.mobile,
        salt,
        passwordHash,
        role: { connect: { id: u.roleId } },
      },
    });
    createdUsers.push({ id: created.id, email: created.email });
  }

  // Service requests
  const sr1 = await prisma.serviceRequest.create({
    data: {
      userId: createdUsers[1].id,
      serviceType: "Birth Certificate",
      description: "Request for birth certificate issuance",
      feeAmount: new Prisma.Decimal("50.00"),
      status: "PENDING",
    },
  });

  const sr2 = await prisma.serviceRequest.create({
    data: {
      userId: createdUsers[1].id,
      serviceType: "Property Tax",
      description: "Query about property tax calculation",
      feeAmount: new Prisma.Decimal("0.00"),
      status: "APPROVED",
    },
  });

  // Audit logs
  await prisma.auditLog.createMany({
    data: [
      {
        userId: createdUsers[0].id,
        action: "Created admin account",
      },
      {
        userId: createdUsers[1].id,
        action: "Created service request: Birth Certificate",
      },
      {
        userId: createdUsers[1].id,
        action: "Created service request: Property Tax",
      },
    ],
  });

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
