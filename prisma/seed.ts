import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await hash('password123', 10);
  
  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password,
    },
  });
  
  console.log({ admin });
  
  // Create sample conversations
  const conversation1 = await prisma.conversation.upsert({
    where: { id: 'conversation1' },
    update: {},
    create: {
      id: 'conversation1',
      phoneNumber: '+1234567890',
      name: 'John Doe',
      lastMessage: 'Hello, I need help with my order',
      lastMessageAt: new Date(),
      isActive: true,
      isAdminTaken: false,
    },
  });
  
  const conversation2 = await prisma.conversation.upsert({
    where: { id: 'conversation2' },
    update: {},
    create: {
      id: 'conversation2',
      phoneNumber: '+0987654321',
      name: 'Jane Smith',
      lastMessage: 'When will my order be delivered?',
      lastMessageAt: new Date(),
      isActive: true,
      isAdminTaken: true,
      adminId: admin.id,
    },
  });
  
  // Create sample messages
  await prisma.message.createMany({
    data: [
      {
        conversationId: conversation1.id,
        content: 'Hello, I need help with my order',
        isFromWhatsApp: true,
        isFromUser: true,
      },
      {
        conversationId: conversation1.id,
        content: 'This is an automated response. An agent will be with you shortly.',
        isFromWhatsApp: true,
      },
      {
        conversationId: conversation2.id,
        content: 'When will my order be delivered?',
        isFromWhatsApp: true,
        isFromUser: true,
      },
      {
        conversationId: conversation2.id,
        content: 'Your order will be delivered tomorrow between 9 AM and 12 PM.',
        isFromWhatsApp: true,
        isFromAdmin: true,
        userId: admin.id,
      },
    ],
  });
  
  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
