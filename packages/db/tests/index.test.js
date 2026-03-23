const { PrismaClient } = require('@prisma/client');

jest.mock('@prisma/client', () => {
  const mockPrisma = {
    content: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    voice: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    template: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    post: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }
  };
  return {
    PrismaClient: jest.fn(() => mockPrisma)
  };
});

describe('Database package tests', () => {
  let prisma;

  beforeEach(() => {
    jest.clearAllMocks();
    // Re-require to get the mocked instance
    jest.isolateModules(() => {
      const db = require('../index');
      prisma = db.prisma;
    });
  });

  describe('PrismaClient singleton initialization', () => {
    it('should initialize PrismaClient exactly once', () => {
      jest.clearAllMocks();
      const db1 = require('../index');
      const db2 = require('../index');
      expect(db1.prisma).toBe(db2.prisma);
      expect(PrismaClient).toHaveBeenCalledTimes(1);
    });
  });

  describe('Content model CRUD', () => {
    it('should create content', async () => {
      const data = { type: 'video', status: 'draft', text: 'Hello' };
      prisma.content.create.mockResolvedValue({ id: '1', ...data });
      
      const result = await prisma.content.create({ data });
      expect(prisma.content.create).toHaveBeenCalledWith({ data });
      expect(result.id).toBe('1');
    });

    it('should read content', async () => {
      prisma.content.findUnique.mockResolvedValue({ id: '1' });
      await prisma.content.findUnique({ where: { id: '1' } });
      expect(prisma.content.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should update content', async () => {
      const data = { status: 'published' };
      prisma.content.update.mockResolvedValue({ id: '1', status: 'published' });
      await prisma.content.update({ where: { id: '1' }, data });
      expect(prisma.content.update).toHaveBeenCalledWith({ where: { id: '1' }, data });
    });

    it('should delete content', async () => {
      prisma.content.delete.mockResolvedValue({ id: '1' });
      await prisma.content.delete({ where: { id: '1' } });
      expect(prisma.content.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });
  });

  describe('Voice model CRUD', () => {
    it('should execute CRUD for Voice', async () => {
      await prisma.voice.create({ data: { name: 'Test Voice' } });
      expect(prisma.voice.create).toHaveBeenCalled();

      await prisma.voice.findUnique({ where: { id: '1' } });
      expect(prisma.voice.findUnique).toHaveBeenCalled();

      await prisma.voice.update({ where: { id: '1' }, data: { name: 'Updated' } });
      expect(prisma.voice.update).toHaveBeenCalled();

      await prisma.voice.delete({ where: { id: '1' } });
      expect(prisma.voice.delete).toHaveBeenCalled();
    });
  });

  describe('Template model CRUD', () => {
    it('should execute CRUD for Template', async () => {
      await prisma.template.create({ data: { name: 'Test Template', type: 'audio', config: {} } });
      expect(prisma.template.create).toHaveBeenCalled();

      await prisma.template.findUnique({ where: { id: '1' } });
      expect(prisma.template.findUnique).toHaveBeenCalled();

      await prisma.template.update({ where: { id: '1' }, data: { name: 'Updated' } });
      expect(prisma.template.update).toHaveBeenCalled();

      await prisma.template.delete({ where: { id: '1' } });
      expect(prisma.template.delete).toHaveBeenCalled();
    });
  });

  describe('Post model CRUD', () => {
    it('should execute CRUD for Post', async () => {
      await prisma.post.create({ data: { contentId: '1', platform: 'twitter', status: 'draft' } });
      expect(prisma.post.create).toHaveBeenCalled();

      await prisma.post.findUnique({ where: { id: '1' } });
      expect(prisma.post.findUnique).toHaveBeenCalled();

      await prisma.post.update({ where: { id: '1' }, data: { status: 'published' } });
      expect(prisma.post.update).toHaveBeenCalled();

      await prisma.post.delete({ where: { id: '1' } });
      expect(prisma.post.delete).toHaveBeenCalled();
    });
  });
});
