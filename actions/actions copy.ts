import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import Handlebars from 'handlebars';



export const generatePDF = async (data: any): Promise<Uint8Array> => {
    // Read and compile the HTML template
    const templatePath = path.join(process.cwd(), 'pdfTempplates', 'report.html');
    const templateContent = fs.readFileSync(templatePath, 'utf-8');
    const template = Handlebars.compile(templateContent);

    // Fill template with data
    const filledHtml = template(data);

    // Launch Puppeteer with required configuration
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    // Set viewport to A4 size
    await page.setViewport({
        width: 794, // A4 width in pixels at 96 DPI
        height: 1123, // A4 height in pixels at 96 DPI
        deviceScaleFactor: 2, // Higher resolution
    });

    await page.setContent(filledHtml, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
    });

    // Add page numbers
    await page.evaluate(() => {
        const elements = document.getElementsByClassName('page-number');
        for (let i = 0; i < elements.length; i++) {
            elements[i].textContent = (i + 1).toString();
        }
    });

    const pdfBuffer = await page.pdf({ 
        format: 'A4',
        printBackground: true,
        margin: {
            top: '1cm',
            right: '1cm',
            bottom: '1cm',
            left: '1cm'
        },
        displayHeaderFooter: true,
        headerTemplate: ' ',
        footerTemplate: ' ',
        preferCSSPageSize: true
    });

    await browser.close();
    return pdfBuffer;
};
