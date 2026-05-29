-- CreateTable
CREATE TABLE "Tender" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "agency" TEXT,
    "province" TEXT,
    "category" TEXT,
    "budget" REAL,
    "status" TEXT,
    "deadline" DATETIME,
    "sourceUrl" TEXT,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
