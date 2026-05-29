/*
  Warnings:

  - You are about to drop the column `agency` on the `Tender` table. All the data in the column will be lost.
  - You are about to drop the column `budget` on the `Tender` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `Tender` table. All the data in the column will be lost.
  - You are about to drop the column `deadline` on the `Tender` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Tender` table. All the data in the column will be lost.
  - You are about to drop the column `sourceUrl` on the `Tender` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Tender` table. All the data in the column will be lost.
  - Added the required column `projectName` to the `Tender` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Tender" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projectName" TEXT NOT NULL,
    "province" TEXT,
    "city" TEXT,
    "owner" TEXT,
    "contractor" TEXT,
    "tenderYear" INTEGER,
    "projectValue" REAL,
    "status" TEXT,
    "sourceFile" TEXT,
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
INSERT INTO "new_Tender" ("asphaltDensityTonPerM3", "asphaltMassTon", "asphaltVolumeM3", "bitumenContentFraction", "bitumenRequiredTon", "createdAt", "id", "layerThicknessM", "province", "roadLengthM", "roadWidthM", "status", "updatedAt") SELECT "asphaltDensityTonPerM3", "asphaltMassTon", "asphaltVolumeM3", "bitumenContentFraction", "bitumenRequiredTon", "createdAt", "id", "layerThicknessM", "province", "roadLengthM", "roadWidthM", "status", "updatedAt" FROM "Tender";
DROP TABLE "Tender";
ALTER TABLE "new_Tender" RENAME TO "Tender";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
