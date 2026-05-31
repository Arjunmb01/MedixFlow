import type { ReactElement } from "react";

/** Dynamically loads @react-pdf/renderer only when exporting a prescription. */
export async function generatePrescriptionPdfBlob(
  element: ReactElement
): Promise<Blob> {
  const { pdf } = await import("@react-pdf/renderer");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return pdf(element as any).toBlob();
}
