import { generatePDF } from "@/actions/actions";

export async function POST(req: Request) {
    const data = await req.json();
    const pdfBuffer = await generatePDF(data);
    return new Response(pdfBuffer, {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename=report.pdf'
        }
    });
}