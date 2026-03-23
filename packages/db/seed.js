const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  const voice = await prisma.voice.create({
    data: {
      name: 'Default Voice',
      sampleUrl: 'https://example.com/voice.wav',
    }
  });

  const template = await prisma.template.create({
    data: {
      name: 'Event Promo 9:16',
      type: 'event-promo',
      config: { width: 1080, height: 1920, textOverlay: true }
    }
  });

  const content = await prisma.content.create({
    data: {
      type: 'event-promo',
      status: 'pending',
      text: 'Come to our awesome event this Friday!',
      platforms: ['tiktok', 'instagram']
    }
  });

  console.log('Database seeded successfully!', {
    voiceId: voice.id,
    templateId: template.id,
    contentId: content.id
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
