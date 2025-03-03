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

// Template mapping for different report types
const TEMPLATE_MAPPING = {
  "Chakra Healing Report": "report-chakra-healing.html",
  "Fortune Report": "report-yearly-fortune.html",
  "Lucky 13 Reports": "report-lucky-13.html",
  "Vedic 4 Report": "report-vedic-4.html",
  "Wealth Comprehensive Report": "report-wealth-comprehensive.html",
  "Wealth Report": "report-wealth.html",
  "Yogas & Doshas": "report-yogas-and-doshas.html"
} as const;

// Define the valid report types
type ReportType = keyof typeof TEMPLATE_MAPPING;

export const generatePDF = async (data: { fortune_report?: { company_details?: { report_name?: string } } }): Promise<Uint8Array> => {
    // Get the report type and find corresponding template
    const reportType = data.fortune_report?.company_details?.report_name as ReportType | undefined;
    if (!reportType) {
        console.warn('Report type not found in data, using default template');
    }
    
    // Get template name, fallback to default if not found
    const templateFile = reportType ? TEMPLATE_MAPPING[reportType] || 'report.html' : 'report.html';
    console.log(`Using template: ${templateFile} for report type: ${reportType}`);
    
    // Read and compile the HTML template from selected folder
    const templatePath = path.join(process.cwd(), 'pdfTempplates', 'selected', templateFile);
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