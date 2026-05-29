/*
  Warnings:

  - You are about to drop the `BitumenSource` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CmemsJob` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EquipmentTrade` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tender` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "BitumenSource";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "CmemsJob";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "EquipmentTrade";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Tender";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "AsphaltMarket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "wilayah" TEXT,
    "kabupatenKota" TEXT,
    "daerah" TEXT,
    "kodeTender" TEXT,
    "kodeRup" TEXT,
    "namaPaket" TEXT,
    "sumberDana" TEXT,
    "nilaiHpsText" TEXT,
    "value" REAL,
    "namaPemenang" TEXT,
    "tahapanTender" TEXT,
    "kebutuhanAspal" REAL,
    "provinsi" TEXT,
    "tipeWilayah" TEXT,
    "tahunAnggaran" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "RegionalDemandIndex" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "wilayah" TEXT,
    "provinsi" TEXT,
    "kabupatenKota" TEXT,
    "tahunAnggaran" INTEGER,
    "packageCount" INTEGER,
    "totalHps" REAL,
    "totalAsphaltTon" REAL,
    "averageHps" REAL,
    "demandIndex" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "DroppedAudit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "wilayah" TEXT,
    "provinsi" TEXT,
    "kabupatenKota" TEXT,
    "tahunAnggaran" INTEGER,
    "namaPaket" TEXT,
    "dropReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "BpsImport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "province" TEXT NOT NULL,
    "importTonnes" REAL NOT NULL,
    "year" INTEGER NOT NULL,
    "importValueUsd" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
