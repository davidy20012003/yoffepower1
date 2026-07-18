declare module "html2pdf.js" {
  type Html2PdfWorker = {
    set(options: Record<string, unknown>): Html2PdfWorker;
    from(element: HTMLElement): Html2PdfWorker;
    toPdf(): Html2PdfWorker;
    get(key: string): Promise<unknown>;
    outputPdf(type: "blob"): Promise<Blob>;
  };

  export default function html2pdf(): Html2PdfWorker;
}
