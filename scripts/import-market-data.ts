import { PrismaClient } from "@prisma/client";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import fs from "fs";

const prisma = new PrismaClient();

const EXCEL_PATH =
  "/Users/paulravisiregar/bd-platform/data/raw/all_indonesia_aspal_final.xlsx";

const CSV_PATH =
  "/Users/paulravisiregar/Work/bps_import_filled_2.csv";

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const cleaned = String(value)
    .replace(/Rp/gi, "")
    .replace(/\./g, "")
    .replace(/,/g, ".")
    .replace(/\s/g, "")
    .trim();

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function toInt(value: unknown): number | null {
  const parsed = toNumber(value);
  return parsed === null ? null : Math.trunc(parsed);
}

function toStringOrNull(value: unknown): string | null {
  if (value === null || value === undefined) return null;

  const text = String(value).trim();
  return text.length > 0 ? text : null;
}

function getSheet(
  workbook: XLSX.WorkBook,
  preferredNames: string[]
): XLSX.WorkSheet | undefined {
  for (const name of preferredNames) {
    if (workbook.Sheets[name]) return workbook.Sheets[name];
  }

  const firstSheetName = workbook.SheetNames[0];
  return firstSheetName ? workbook.Sheets[firstSheetName] : undefined;
}

async function importExcel() {
  const workbook = XLSX.readFile(EXCEL_PATH);

  console.log("Detected Excel sheets:", workbook.SheetNames);

  const cleanSheet = getSheet(workbook, ["clean_aspal_market", "Sheet1"]);
  const demandSheet = workbook.Sheets["regional_demand_index"];
  const droppedSheet = workbook.Sheets["dropped_audit"];

  if (!cleanSheet) {
    throw new Error(
      `No usable market sheet found. Available sheets: ${workbook.SheetNames.join(
        ", "
      )}`
    );
  }

  const cleanRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
    cleanSheet
  );

  console.log(`Excel market rows: ${cleanRows.length}`);

  await prisma.asphaltMarket.deleteMany();

  for (const row of cleanRows) {
    await prisma.asphaltMarket.create({
      data: {
        wilayah: toStringOrNull(row["Wilayah"]),
        kabupatenKota: toStringOrNull(row["Kabupaten/Kota"]),
        daerah: toStringOrNull(row["Daerah"]),
        kodeTender: toStringOrNull(row["Kode Tender"]),
        kodeRup: toStringOrNull(row["Kode RUP"]),
        namaPaket: toStringOrNull(row["Nama Paket"]),
        sumberDana: toStringOrNull(row["Sumber Dana"]),
        nilaiHpsText: toStringOrNull(row["Nilai HPS"]),
        value: toNumber(row["Value"]),
        namaPemenang: toStringOrNull(row["Nama Pemenang"]),
        tahapanTender: toStringOrNull(row["Tahapan Tender"]),
        kebutuhanAspal: toNumber(row["Kebutuhan Aspal"]),
        provinsi: toStringOrNull(row["Provinsi"]),
        tipeWilayah: toStringOrNull(row["Tipe Wilayah"]),
        tahunAnggaran: toInt(row["Tahun Anggaran"]),
      },
    });
  }

  if (demandSheet) {
    const demandRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
      demandSheet
    );

    console.log(`Excel demand rows: ${demandRows.length}`);

    await prisma.regionalDemandIndex.deleteMany();

    for (const row of demandRows) {
      await prisma.regionalDemandIndex.create({
        data: {
          wilayah: toStringOrNull(row["Wilayah"]),
          provinsi: toStringOrNull(row["Provinsi"]),
          kabupatenKota: toStringOrNull(row["Kabupaten/Kota"]),
          tahunAnggaran: toInt(row["Tahun Anggaran"]),
          packageCount: toInt(row["n_packages"]),
          totalHps: toNumber(row["total_hps"]),
          totalAsphaltTon: toNumber(row["total_asphalt_ton"]),
          averageHps: toNumber(row["avg_hps"]),
          demandIndex: toNumber(row["demand_index_0_100"]),
        },
      });
    }
  } else {
    console.log(
      "No regional_demand_index sheet found. Rebuilding regional demand index from market rows."
    );

    await prisma.regionalDemandIndex.deleteMany();

    const grouped = new Map<
      string,
      {
        wilayah: string | null;
        provinsi: string | null;
        kabupatenKota: string | null;
        tahunAnggaran: number | null;
        packageCount: number;
        totalHps: number;
        totalAsphaltTon: number;
      }
    >();

    for (const row of cleanRows) {
      const wilayah = toStringOrNull(row["Wilayah"]);
      const provinsi = toStringOrNull(row["Provinsi"]);
      const kabupatenKota = toStringOrNull(row["Kabupaten/Kota"]);
      const tahunAnggaran = toInt(row["Tahun Anggaran"]);
      const value = toNumber(row["Value"]) ?? 0;
      const kebutuhanAspal = toNumber(row["Kebutuhan Aspal"]) ?? 0;

      const key = [
        wilayah ?? "",
        provinsi ?? "",
        kabupatenKota ?? "",
        tahunAnggaran ?? "",
      ].join("|");

      const existing =
        grouped.get(key) ??
        {
          wilayah,
          provinsi,
          kabupatenKota,
          tahunAnggaran,
          packageCount: 0,
          totalHps: 0,
          totalAsphaltTon: 0,
        };

      existing.packageCount += 1;
      existing.totalHps += value;
      existing.totalAsphaltTon += kebutuhanAspal;

      grouped.set(key, existing);
    }

    const groupedRows = Array.from(grouped.values());

    const maxAsphalt = Math.max(
      ...groupedRows.map((row) => row.totalAsphaltTon),
      0
    );

    for (const row of groupedRows) {
      await prisma.regionalDemandIndex.create({
        data: {
          wilayah: row.wilayah,
          provinsi: row.provinsi,
          kabupatenKota: row.kabupatenKota,
          tahunAnggaran: row.tahunAnggaran,
          packageCount: row.packageCount,
          totalHps: row.totalHps,
          totalAsphaltTon: row.totalAsphaltTon,
          averageHps:
            row.packageCount > 0 ? row.totalHps / row.packageCount : null,
          demandIndex:
            maxAsphalt > 0 ? (row.totalAsphaltTon / maxAsphalt) * 100 : 0,
        },
      });
    }

    console.log(`Rebuilt regional demand rows: ${groupedRows.length}`);
  }

  if (droppedSheet) {
    const droppedRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
      droppedSheet
    );

    console.log(`Excel dropped rows: ${droppedRows.length}`);

    await prisma.droppedAudit.deleteMany();

    for (const row of droppedRows) {
      await prisma.droppedAudit.create({
        data: {
          wilayah: toStringOrNull(row["Wilayah"]),
          provinsi: toStringOrNull(row["Provinsi"]),
          kabupatenKota: toStringOrNull(row["Kabupaten/Kota"]),
          tahunAnggaran: toInt(row["Tahun Anggaran"]),
          namaPaket: toStringOrNull(row["Nama Paket"]),
          dropReason: toStringOrNull(row["drop_reason"]),
        },
      });
    }
  } else {
    console.log("No dropped_audit sheet found. Clearing dropped audit table.");
    await prisma.droppedAudit.deleteMany();
  }
}

async function importCsv() {
  const csvText = fs.readFileSync(CSV_PATH, "utf8");

  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length > 0) {
    console.warn(parsed.errors);
  }

  await prisma.bpsImport.deleteMany();

  for (const row of parsed.data) {
    await prisma.bpsImport.create({
      data: {
        province: String(row["Province"] ?? "").trim(),
        importTonnes: toNumber(row["Import Tonnes"]) ?? 0,
        year: toInt(row["Year"]) ?? 0,
        importValueUsd: toNumber(row["Import Value USD"]) ?? 0,
      },
    });
  }

  console.log(`CSV import rows: ${parsed.data.length}`);
}

async function main() {
  if (!fs.existsSync(EXCEL_PATH)) {
    throw new Error(`Excel file not found: ${EXCEL_PATH}`);
  }

  if (!fs.existsSync(CSV_PATH)) {
    throw new Error(`CSV file not found: ${CSV_PATH}`);
  }

  await importExcel();
  await importCsv();

  const asphaltCount = await prisma.asphaltMarket.count();
  const demandCount = await prisma.regionalDemandIndex.count();
  const droppedCount = await prisma.droppedAudit.count();
  const importCount = await prisma.bpsImport.count();

  console.log("Import complete:");
  console.log(`- AsphaltMarket: ${asphaltCount}`);
  console.log(`- RegionalDemandIndex: ${demandCount}`);
  console.log(`- DroppedAudit: ${droppedCount}`);
  console.log(`- BpsImport: ${importCount}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
  