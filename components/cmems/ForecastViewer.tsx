"use client";

import { useState } from "react";

type ForecastFile = {
  title: string;
  variable: string;
  description: string;
  href: string;
};

export function ForecastViewer({ files }: { files: ForecastFile[] }) {
  const [selectedHref, setSelectedHref] = useState<string | null>(null);

  const selectedFile = files.find((file) => file.href === selectedHref);

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {files.map((file) => {
          const isSelected = file.href === selectedHref;

          return (
            <button
              key={file.href}
              type="button"
              onClick={() => setSelectedHref(file.href)}
              className={
                isSelected
                  ? "rounded-3xl border border-slate-900 bg-slate-950 p-5 text-left text-white shadow-sm transition"
                  : "rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
              }
            >
              <p className={isSelected ? "text-sm font-medium text-slate-300" : "text-sm font-medium text-slate-500"}>
                {file.variable}
              </p>

              <h3 className={isSelected ? "mt-2 text-lg font-semibold tracking-tight text-white" : "mt-2 text-lg font-semibold tracking-tight text-slate-950"}>
                {file.title}
              </h3>

              <p className={isSelected ? "mt-3 text-sm leading-6 text-slate-300" : "mt-3 text-sm leading-6 text-slate-500"}>
                {file.description}
              </p>

              <p className={isSelected ? "mt-5 text-sm font-medium text-white" : "mt-5 text-sm font-medium text-slate-900"}>
                {isSelected ? "Selected" : "Load preview →"}
              </p>
            </button>
          );
        })}
      </section>

      {!selectedFile ? (
        <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <h3 className="text-xl font-semibold tracking-tight text-slate-950">
            No forecast loaded
          </h3>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500">
            Select one forecast card above. The heavy HTML visualization will
            load only after selection, which keeps the page faster.
          </p>
        </section>
      ) : (
        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Active Forecast
                </p>
                <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                  {selectedFile.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {selectedFile.description}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedHref(null)}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Unload
                </button>

                <a
                  href={selectedFile.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  Open full HTML
                </a>
              </div>
            </div>
          </div>

          <div className="h-[760px] overflow-hidden rounded-b-3xl bg-slate-950">
            <iframe
              key={selectedFile.href}
              src={selectedFile.href}
              title={selectedFile.title}
              loading="lazy"
              className="h-full w-full border-0"
            />
          </div>
        </section>
      )}
    </div>
  );
}
