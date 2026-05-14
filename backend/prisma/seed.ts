import { Priority, Role, TaskCategory, TaskStatus } from "@prisma/client";
import { prisma } from "../src/config/prisma";
import { hashPassword } from "../src/utils/password";

function daysFromNow(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(10, 0, 0, 0);
  return date;
}

async function main() {
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await hashPassword("Admin@123");
  const memberPasswordHash = await hashPassword("Member@123");

  const admin = await prisma.user.create({
    data: {
      name: "EcoTrack Admin",
      email: "admin@ecotrack.com",
      passwordHash,
      role: Role.ADMIN
    }
  });

  const [ravi, sneha, arjun] = await Promise.all([
    prisma.user.create({
      data: {
        name: "Ravi Kumar",
        email: "ravi@ecotrack.com",
        passwordHash: memberPasswordHash,
        role: Role.MEMBER
      }
    }),
    prisma.user.create({
      data: {
        name: "Sneha Iyer",
        email: "sneha@ecotrack.com",
        passwordHash: memberPasswordHash,
        role: Role.MEMBER
      }
    }),
    prisma.user.create({
      data: {
        name: "Arjun Mehta",
        email: "arjun@ecotrack.com",
        passwordHash: memberPasswordHash,
        role: Role.MEMBER
      }
    })
  ]);

  const projects = await Promise.all([
    prisma.project.create({
      data: {
        name: "University Campus North Zone",
        description:
          "Daily collection and inspection route covering academic blocks, library gate, and hostel pickup points.",
        location: "North Campus, Sector 12",
        createdById: admin.id
      }
    }),
    prisma.project.create({
      data: {
        name: "Market Road Collection Route",
        description:
          "High-footfall municipal route for shopfront pickup, complaint response, and post-collection cleaning.",
        location: "Market Road, Ward 7",
        createdById: admin.id
      }
    }),
    prisma.project.create({
      data: {
        name: "Green Valley Apartments",
        description:
          "Residential waste segregation checks, dry waste pickup, and overflow inspections for blocks A to D.",
        location: "Green Valley Society",
        createdById: admin.id
      }
    }),
    prisma.project.create({
      data: {
        name: "Recycling Awareness Drive",
        description:
          "Short campaign for recyclable waste transfer and public awareness around sorted waste disposal.",
        location: "Community Hall and Sorting Center",
        createdById: admin.id
      }
    })
  ]);

  for (const project of projects) {
    await prisma.projectMember.createMany({
      data: [
        { projectId: project.id, userId: admin.id },
        { projectId: project.id, userId: ravi.id },
        { projectId: project.id, userId: sneha.id }
      ],
      skipDuplicates: true
    });
  }

  await prisma.projectMember.create({
    data: { projectId: projects[1].id, userId: arjun.id }
  });

  await prisma.task.createMany({
    data: [
      {
        title: "Inspect overflowing bin near Library Gate",
        description:
          "Check the smart bin fill level and confirm whether extra collection is needed before evening rush.",
        status: TaskStatus.TODO,
        priority: Priority.HIGH,
        category: TaskCategory.OVERFLOW_INSPECTION,
        dueDate: daysFromNow(-1),
        projectId: projects[0].id,
        assignedToId: ravi.id,
        createdById: admin.id
      },
      {
        title: "Collect dry waste from Block C",
        description:
          "Coordinate dry waste pickup from apartment Block C and update the status after collection.",
        status: TaskStatus.IN_PROGRESS,
        priority: Priority.MEDIUM,
        category: TaskCategory.BIN_PICKUP,
        dueDate: daysFromNow(1),
        projectId: projects[2].id,
        assignedToId: sneha.id,
        createdById: admin.id
      },
      {
        title: "Resolve complaint from Market Road",
        description:
          "Visit the reported pickup point, clear missed waste, and record completion once the complaint is closed.",
        status: TaskStatus.TODO,
        priority: Priority.HIGH,
        category: TaskCategory.COMPLAINT_RESOLUTION,
        dueDate: daysFromNow(0),
        projectId: projects[1].id,
        assignedToId: arjun.id,
        createdById: admin.id
      },
      {
        title: "Check segregation compliance at Green Valley",
        description:
          "Inspect wet and dry waste bins for mixed disposal and note repeat non-compliance locations.",
        status: TaskStatus.DONE,
        priority: Priority.LOW,
        category: TaskCategory.SEGREGATION_CHECK,
        dueDate: daysFromNow(-2),
        projectId: projects[2].id,
        assignedToId: ravi.id,
        createdById: admin.id
      },
      {
        title: "Transfer recyclable waste to sorting center",
        description:
          "Move collected recyclable waste from the awareness drive to the sorting center for processing.",
        status: TaskStatus.IN_PROGRESS,
        priority: Priority.MEDIUM,
        category: TaskCategory.RECYCLING_TRANSFER,
        dueDate: daysFromNow(2),
        projectId: projects[3].id,
        assignedToId: sneha.id,
        createdById: admin.id
      },
      {
        title: "Clean pickup point near Food Court",
        description:
          "Clear leftover litter after the regular collection vehicle leaves the campus food court area.",
        status: TaskStatus.TODO,
        priority: Priority.LOW,
        category: TaskCategory.ROUTE_CLEANING,
        dueDate: daysFromNow(3),
        projectId: projects[0].id,
        assignedToId: ravi.id,
        createdById: admin.id
      },
      {
        title: "Handle hazardous waste alert near workshop",
        description:
          "Verify reported chemical waste, isolate the bin area, and escalate if protective pickup is required.",
        status: TaskStatus.TODO,
        priority: Priority.HIGH,
        category: TaskCategory.HAZARDOUS_ALERT,
        dueDate: daysFromNow(-3),
        projectId: projects[0].id,
        assignedToId: sneha.id,
        createdById: admin.id
      }
    ]
  });

  console.log("EcoTrack seed data inserted");
  console.log("Admin: admin@ecotrack.com / Admin@123");
  console.log("Members: ravi@ecotrack.com, sneha@ecotrack.com, arjun@ecotrack.com / Member@123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

