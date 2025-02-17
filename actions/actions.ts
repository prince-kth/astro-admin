import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import Handlebars from 'handlebars';

// Add helper registration before template compilation
Handlebars.registerHelper('times', function(n, block) {
  var accum = '';
  for(var i = 0; i < n; ++i)
    accum += block.fn(i);
  return accum;
});

export const generatePDF = async (data: any): Promise<Uint8Array> => {
    // Read and compile the HTML template
    const templatePath = path.join(process.cwd(), 'pdfTempplates', 'report.html');
    const templateContent = fs.readFileSync(templatePath, 'utf-8');
    const template = Handlebars.compile(templateContent);

    // Fill template with data
    const filledHtml = template(data);

    // Launch Puppeteer with required configuration for serverless environment
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(filledHtml, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
    });

    const pdfBuffer = await page.pdf({ 
        format: 'A4',
        printBackground: true,
        margin: {
            top: '20px',
            right: '20px',
            bottom: '20px',
            left: '20px'
        }
    });
    await browser.close();

    return pdfBuffer;
};