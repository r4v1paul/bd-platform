import { PrismaClient } from "@prisma/client";
import * as XLSX from "xlsx";
import fs from "fs";

const prisma = new PrismaClient();

const BITUMEN_PATH = "./data/raw/Import Bitumen.xlsx";

const PRODUCT_CODE = "2714";

const PRODUCT_DESCRIPTION =
  "Bitumen and asphalt, natural; bituminous or oil-shale and tar sands; asphaltites and asphaltic products";

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const cleaned = String(value)
    .replace(/,/g, "")
    .replace(/\s/g, "")
    .trim();

  const parsed = Number(cleaned);

  return Number.isFinite(parsed) ? parsed : null;
}

function toStringOrNull(value: unknown): string | null {
  if (value === null || value === undefined) return null;

  const text = String(value).trim();
  return text.length > 0 ? text : null;
}

function extractMonth(header: string): string | null {
  const match = header.match(/Imported value in (\d{4}-M\d{2})/);
  return match ? match[1] : null;
}

async function main() {
  if (!fs.existsSync(BITUMEN_PATH)) {
    throw new Error(`Bitumen file not found: ${BITUMEN_PATH}`);
  }

  const workbook = XLSX.readFile(BITUMEN_PATH);

  console.log("Detected bitumen sheets:", workbook.SheetNames);

  const sheetName = workbook.SheetNames[0];

  if (!sheetName) {
    throw new Error("No sheets found in bitumen workbook.");
  }

  const sheet = workbook.Sheets[sheetName];

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: null,
  });

  console.log(`Bitumen source rows: ${rows.length}`);

  if (rows.length === 0) {
    throw new Error("Bitumen workbook contains no data rows.");
  }

  const headers = Object.keys(rows[0]);

  const importerHeader = headers.find(
    (header) => header.trim().toLowerCase() === "importers"
  );

  if (!importerHeader) {
    throw new Error(
      `Could not find Importers column. Found headers: ${headers.join(", ")}`
    );
  }

  const monthHeaders = headers
    .map((header) => ({
      header,
      month: extractMonth(header),
    }))
    .filter(
      (item): item is { header: string; month: string } => item.month !== null
    );

  if (monthHeaders.length === 0) {
    throw new Error(
      `No monthly imported-value columns found. Found headers: ${headers.join(", ")}`
    );
  }

  console.log(`Detected month columns: ${monthHeaders.length}`);

  await prisma.bitumenImporterMonthly.deleteMany();

  let inserted = 0;
  const importers = new Set<string>();

  for (const row of rows) {
    const importer = toStringOrNull(row[importerHeader]);

    if (!importer) continue;

    importers.add(importer);

    for (const monthHeader of monthHeaders) {
      const importedValueUsdK = toNumber(row[monthHeader.header]);

      if (importedValueUsdK === null) continue;

      await prisma.bitumenImporterMonthly.create({
        data: {
          importer,
          productCode: PRODUCT_CODE,
          productDescription: PRODUCT_DESCRIPTION,
          month: monthHeader.month,
          importedValueUsdK,
          importedValueUsd: importedValueUsdK * 1000,
          source: "Trade Map",
        },
      });

      inserted += 1;
    }
  }

  console.log("Bitumen import complete:");
  console.log(`- Unique importers detected: ${importers.size}`);
  console.log(`- Monthly records inserted: ${inserted}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });