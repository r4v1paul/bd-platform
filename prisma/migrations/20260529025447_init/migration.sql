-- CreateTable
CREATE TABLE "Tender" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectName" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "city" TEXT,
    "owner" TEXT,
    "contractor" TEXT,
    "tenderYear" INTEGER NOT NULL,
    "projectValue" REAL,
    "roadLengthM" REAL,
    "roadWidthM" REAL,
    "layerThicknessM" REAL,
    "asphaltDensityTonPerM3" REAL,
    "bitumenContentFraction" REAL,
    "asphaltVolumeM3" REAL,
    "asphaltMassTon" REAL,
    "bitumenRequiredTon" REAL,
    "status" TEXT,
    "sourceFile" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BitumenSource" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "country" TEXT NOT NULL,
    "producerName" TEXT NOT NULL,
    "refineryName" TEXT,
    "bitumenGrade" TEXT,
    "estimatedCapacityTon" REAL,
    "exportAvailability" REAL,
    "distanceToIndonesiaKm" REAL,
    "freightRiskScore" REAL,
    "costScore" REAL,
    "qualityScore" REAL,
    "logisticsScore" REAL,
    "availabilityScore" REAL,
    "riskScore" REAL,
    "sourcingScore" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "EquipmentTrade" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hsCode" TEXT NOT NULL,
    "equipmentType" TEXT NOT NULL,
    "importerCountry" TEXT NOT NULL,
    "exporterCountry" TEXT,
    "importValueUsd" REAL,
    "importVolume" REAL,
    "unitPriceUsd" REAL,
    "growthRate" REAL,
    "tariffRate" REAL,
    "logisticsScore" REAL,
    "competitionScore" REAL,
    "exportPotentialScore" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CmemsJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filePath" TEXT NOT NULL,
    "jobType" TEXT NOT NULL,
    "instructionJson" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "resultPath" TEXT,
    "errorMessage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME
);
