-- CreateTable
CREATE TABLE "Moodboard" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'לוח מצב רוח חדש',
    "nodesData" TEXT NOT NULL DEFAULT '[]',
    "edgesData" TEXT NOT NULL DEFAULT '[]',
    "projectId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Moodboard_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Moodboard" ADD CONSTRAINT "Moodboard_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
