-- CreateTable
CREATE TABLE "Content" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "text" TEXT,
    "audioUrl" TEXT,
    "videoUrl" TEXT,
    "platforms" TEXT[],
    "scheduledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Voice" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sampleUrl" TEXT,
    "modelPath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Voice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Template" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "postedAt" TIMESTAMP(3),
    "externalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
