-- CreateTable
CREATE TABLE "BitumenImporterMonthly" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "importer" TEXT NOT NULL,
    "productCode" TEXT NOT NULL DEFAULT '2714',
    "productDescription" TEXT,
    "month" TEXT NOT NULL,
    "importedValueUsdK" REAL NOT NULL,
    "importedValueUsd" REAL NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'Trade Map',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
