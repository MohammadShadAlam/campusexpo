"use client";

import { useState } from "react";

export function IdCardActions({ payload }: { payload: string }) {
  const [msg, setMsg] = useState("");

  const download = () => {
    const blob = new Blob([`CampusExpo Digital ID\n${payload.split("|").join("\n")}`], {
      type: "text/plain",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "campusexpo-id.txt";
    a.click();
    URL.revokeObjectURL(url);
    setMsg("ID card downloaded.");
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "CampusExpo Digital ID", text: payload });
        return;
      } catch {
        /* cancelled */
      }
    }
    await navigator.clipboard.writeText(payload);
    setMsg("ID details copied to clipboard.");
  };

  return (
    <div className="mt-4">
      <div className="grid grid-cols-3 gap-3">
        <button onClick={() => window.print()} className="btn btn-ghost">
          Show QR
        </button>
        <button onClick={download} className="btn btn-primary">
          Download
        </button>
        <button onClick={share} className="btn btn-gold">
          Share
        </button>
      </div>
      {msg && <p className="mt-2 text-center text-[12px] text-emerald-600 font-medium">{msg}</p>}
    </div>
  );
}
