// import { NextResponse } from 'next/server';
// import puppeteer from 'puppeteer';
// import * as fs from 'fs';
// import * as path from 'path';
// import Handlebars from 'handlebars';

// export async function POST(req: Request) {
//   try {
//     const data = await req.json();
    
//     // Read the HTML template
//     const templatePath = path.join(process.cwd(), 'frontend', 'pdfTemplates', 'report.html');
//     const templateContent = fs.readFileSync(templatePath, 'utf-8');
    
//     // Compile the template with Handlebarsik
//     const template = Handlebars.compile(templateContent);
//     const html = template({
//       kundliChartBase64: data.kundliChartBase64,
//       fortune_report: {
//         company_details: {
//           name: data.companyName,
//           slogan: data.companySlogan,
//           year: data.companyYear,
//           report_name: data.reportName,
//           astrologer_name: data.astrologerName,
//           email: data.email
//         }
//       },
//       user_details: {
//         dob: data.dateOfBirth,
//         time_of_birth: data.timeOfBirth,
//         place_of_birth: data.birthPlace,
//         latitude: data.latitude,
//         longitude: data.longitude
//       }
//     });

//     // Launch puppeteer
//     const browser = await puppeteer.launch({
//       headless: 'new'
//     });
//     const page = await browser.newPage();
    
//     // Set content and wait for charts to render
//     await page.setContent(html, { waitUntil: 'networkidle0' });
    
//     // Generate PDF
//     const pdf = await page.pdf({
//       format: 'A4',
//       printBackground: true,
//       margin: {
//         top: '20mm',
//         bottom: '20mm',
//         left: '20mm',
//         right: '20mm'
//       }
//     });

//     await browser.close();

//     // Return the PDF
//     return new NextResponse(pdf, {
//       headers: {
//         'Content-Type': 'application/pdf',
//         'Content-Disposition': 'attachment; filename=report.pdf'
//       }
//     });
//   } catch (error) {
//     console.error('Error generating PDF:', error);
//     return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
//   }
// }