'use server'

import puppeteer from 'puppeteer';
import Handlebars from 'handlebars';

export const generatePDF = async (data: any): Promise<Uint8Array> => {
    // Get the HTML template content
    const templateContent = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Yearly Fortune Report {{year}}</title>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.19/tailwind.min.css" rel="stylesheet">
        <style>
            @page {
                margin: 1cm;
                size: A4;
            }
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
            }
            .page-break {
                page-break-before: always;
            }
            .header {
                position: fixed;
                top: 0;
                width: 100%;
                height: 60px;
                padding: 10px 0;
                text-align: center;
                border-bottom: 1px solid #eee;
            }
            .footer {
                position: fixed;
                bottom: 0;
                width: 100%;
                height: 50px;
                padding: 10px 0;
                text-align: center;
                border-top: 1px solid #eee;
            }
            .content {
                margin-top: 80px;
                margin-bottom: 60px;
                padding: 0 20px;
            }
            .section {
                margin-bottom: 30px;
                break-inside: avoid;
            }
            .company-title {
                font-size: 2.5rem;
                font-weight: bold;
                color: #1a365d;
                text-transform: uppercase;
                letter-spacing: 2px;
                text-align: center;
                margin: 20px 0;
            }
            .front-page {
                text-align: center;
                padding: 50px 20px;
                min-height: 100vh;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
            }
            .ganesh-mantra {
                font-style: italic;
                margin: 30px 0;
                padding: 20px;
                border: 1px solid #ddd;
                border-radius: 8px;
                background-color: #f9f9f9;
            }
            .highlight-card {
                border: 1px solid #ddd;
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 15px;
                background-color: #fff;
            }
            .month-section {
                border: 1px solid #eee;
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 30px;
                background-color: #fff;
            }
        </style>
    </head>
    <body>
        <!-- Front Page -->
        <div class="front-page">
            <div class="company-title">{{company_name}}</div>
            <p class="text-xl mt-4">{{company_tagline}}</p>
            <p class="text-2xl mt-4">{{year}}</p>
            <div class="ganesh-mantra">
                <p>॥ श्री गणेशाय नमः ॥</p>
                <p>वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ ।</p>
                <p>निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा ॥</p>
            </div>
            <h2 class="text-3xl font-bold mt-8">{{report_title}}</h2>
            <p class="mt-4">Prepared by: {{astrologer_name}}</p>
        </div>

        <!-- About Report -->
        <div class="page-break"></div>
        <div class="content">
            <div class="section">
                <h2 class="text-2xl font-bold mb-4">About the Report</h2>
                <p>{{about_report}}</p>
            </div>
        </div>

        <!-- Basic Details -->
        <div class="page-break"></div>
        <div class="content">
            <div class="section">
                <h2 class="text-2xl font-bold mb-4">Basic Details</h2>
                <div class="highlight-card">
                    <table class="w-full">
                        {{#each basic_details}}
                        <tr>
                            <td class="py-2 font-semibold">{{this.label}}</td>
                            <td class="py-2">{{this.value}}</td>
                        </tr>
                        {{/each}}
                    </table>
                </div>
            </div>
        </div>

        <!-- Monthly Forecasts -->
        {{#each months}}
        <div class="page-break"></div>
        <div class="content">
            <div class="section">
                <h2 class="text-2xl font-bold mb-4">Fortune Report - {{this.name}} {{../year}}</h2>
                
                <!-- Astrology Highlights -->
                <div class="highlight-card">
                    <h3 class="text-xl font-bold mb-3">Astrology Highlights</h3>
                    <ul class="list-disc pl-5">
                        {{#each this.highlights}}
                        <li class="mb-2">{{this}}</li>
                        {{/each}}
                    </ul>
                </div>

                <!-- Focus Areas -->
                <h3 class="text-xl font-bold mt-6 mb-4">Focus Areas</h3>
                
                <!-- Love & Relationships -->
                <div class="highlight-card">
                    <h4 class="text-lg font-bold mb-2">Love & Relationships</h4>
                    <p>{{this.love_relationships}}</p>
                </div>

                <!-- Career & Finances -->
                <div class="highlight-card">
                    <h4 class="text-lg font-bold mb-2">Career & Finances</h4>
                    <p>{{this.career_finances}}</p>
                </div>

                <!-- Health & Wellness -->
                <div class="highlight-card">
                    <h4 class="text-lg font-bold mb-2">Health & Wellness</h4>
                    <p>{{this.health_wellness}}</p>
                </div>

                <!-- Lucky Symbols -->
                <div class="highlight-card">
                    <h4 class="text-lg font-bold mb-2">Lucky Symbols</h4>
                    <ul>
                        {{#each this.lucky_symbols}}
                        <li>{{this.label}}: {{this.value}}</li>
                        {{/each}}
                    </ul>
                </div>

                <!-- Remedies -->
                <div class="highlight-card">
                    <h4 class="text-lg font-bold mb-2">Remedies</h4>
                    <ul class="list-disc pl-5">
                        {{#each this.remedies}}
                        <li class="mb-2">{{this}}</li>
                        {{/each}}
                    </ul>
                </div>
            </div>
        </div>
        {{/each}}

        <!-- Last Page -->
        <div class="page-break"></div>
        <div class="front-page">
            <div class="company-title">{{company_name}}</div>
            <p class="text-xl mt-4">{{company_tagline}}</p>
            <div class="social-links mt-8">
                {{#each social_media_links}}
                <a href="{{this.url}}" class="mx-2">{{this.platform}}</a>
                {{/each}}
            </div>
            <p class="mt-4">Email: {{contact_email}}</p>
        </div>

        <!-- Header for all pages except front and last -->
        <div class="header">
            <div class="text-xl font-bold">{{company_name}}</div>
        </div>

        <!-- Footer for all pages except front and last -->
        <div class="footer">
            <div>Page <span class="page-number"></span></div>
            <div>{{report_title}}</div>
        </div>
    </body>
    </html>`;

    // Compile template
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
