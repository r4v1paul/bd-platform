import { PrismaClient } from "@prisma/client";
import { calculateAsphalt } from "../lib/asphalt";

const prisma = new PrismaClient();

async function main() {
  await prisma.tender.deleteMany();

  const tenders = [
    {
      projectName: "Road Improvement Package A",
      province: "East Java",
      city: "Surabaya",
      owner: "Public Works Department",
      contractor: "PT Alpha Konstruksi",
      tenderYear: 2025,
      projectValue: 12500000000,
      roadLengthM: 10000,
      roadWidthM: 7,
      layerThicknessM: 0.05,
      asphaltDensityTonPerM3: 2.35,
      bitumenContentFraction: 0.055,
      status: "Awarded",
      sourceFile: "seed",
    },
    {
      projectName: "Provincial Road Maintenance B",
      province: "West Java",
      city: "Bandung",
      owner: "Provincial Government",
      contractor: "PT Beton Raya",
      tenderYear: 2025,
      projectValue: 8700000000,
      roadLengthM: 6500,
      roadWidthM: 6,
      layerThicknessM: 0.04,
      asphaltDensityTonPerM3: 2.35,
      bitumenContentFraction: 0.055,
      status: "Tender",
      sourceFile: "seed",
    },
    {
      projectName: "Port Access Road C",
      province: "Central Java",
      city: "Semarang",
      owner: "Port Authority",
      contractor: "PT Nusantara Infra",
      tenderYear: 2024,
      projectValue: 15300000000,
      roadLengthM: 8200,
      roadWidthM: 7.5,
      layerThicknessM: 0.06,
      asphaltDensityTonPerM3: 2.35,
      bitumenContentFraction: 0.055,
      status: "Awarded",
      sourceFile: "seed",
    },
    {
      projectName: "Industrial Estate Road D",
      province: "Banten",
      city: "Cilegon",
      owner: "Industrial Estate Authority",
      contractor: "PT Jalan Makmur",
      tenderYear: 2026,
      projectValue: 22400000000,
      roadLengthM: 12000,
      roadWidthM: 8,
      layerThicknessM: 0.05,
      asphaltDensityTonPerM3: 2.35,
      bitumenContentFraction: 0.055,
      status: "Planned",
      sourceFile: "seed",
    },
  ];

  for (const tender of tenders) {
    const result = calculateAsphalt({
      roadLengthM: tender.roadLengthM,
      roadWidthM: tender.roadWidthM,
      layerThicknessM: tender.layerThicknessM,
      asphaltDensityTonPerM3: tender.asphaltDensityTonPerM3,
      bitumenContentFraction: tender.bitumenContentFraction,
    });

    await prisma.tender.create({
      data: {
        ...tender,
        asphaltVolumeM3: result.asphaltVolumeM3,
        asphaltMassTon: result.asphaltMassTon,
        bitumenRequiredTon: result.bitumenRequiredTon,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Seed completed.");
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
