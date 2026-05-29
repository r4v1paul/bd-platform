/*
  Warnings:

  - Added the required column `asphaltDensityTonPerM3` to the `Tender` table without a default value. This is not possible if the table is not empty.
  - Added the required column `asphaltMassTon` to the `Tender` table without a default value. This is not possible if the table is not empty.
  - Added the required column `asphaltVolumeM3` to the `Tender` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bitumenContentFraction` to the `Tender` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bitumenRequiredTon` to the `Tender` table without a default value. This is not possible if the table is not empty.
  - Added the required column `layerThicknessM` to the `Tender` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roadLengthM` to the `Tender` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roadWidthM` to the `Tender` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Tender" (
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
    "roadLengthM" REAL NOT NULL,
    "roadWidthM" REAL NOT NULL,
    "layerThicknessM" REAL NOT NULL,
    "asphaltDensityTonPerM3" REAL NOT NULL,
    "bitumenContentFraction" REAL NOT NULL,
    "asphaltVolumeM3" REAL NOT NULL,
    "asphaltMassTon" REAL NOT NULL,
    "bitumenRequiredTon" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Tender" ("agency", "budget", "category", "createdAt", "deadline", "description", "id", "province", "sourceUrl", "status", "title", "updatedAt") SELECT "agency", "budget", "category", "createdAt", "deadline", "description", "id", "province", "sourceUrl", "status", "title", "updatedAt" FROM "Tender";
DROP TABLE "Tender";
ALTER TABLE "new_Tender" RENAME TO "Tender";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
