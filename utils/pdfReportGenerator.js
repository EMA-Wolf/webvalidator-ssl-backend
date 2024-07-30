const PDFDocument = require('pdfkit-table');
// const pdfmake = require('pdfmake');
const PdfPrinter = require('pdfmake');

const pdf = require('html-pdf');
const handlebars = require('handlebars');
const puppeteer = require('puppeteer');
const { jsPDF } = require('jspdf');
const html2canvas = require('html2canvas');
const fs = require('fs');

require("dotenv").config();
// const  path = require("path")

//First Pdf maker code using pdfkit
const generatePDFReport = (userName, results, errors) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const buffers = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            const pdfData = Buffer.concat(buffers);
            resolve(pdfData);
        });

        doc.fontSize(18).text('Website Scan Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(14).text(`User: ${userName}`, { align: 'left' });
        doc.moveDown();

        // Table 1
        const table1 = {
            headers: ['Sites without SSL', 'Malware Detected Sites', '\tSites with Errors'],
            rows: []
        };

        results.forEach(site => {
            if (!site.ssl) {
                table1.rows.push([site.name, '', '']);
            }
            if (site.mal) {
                table1.rows.push(['', site.name, '']);
            }
        });

        errors.forEach(error => {
            table1.rows.push(['', '', error.name]);
        });

        doc.table(table1, {
            prepareHeader: () => doc.font('Helvetica-Bold'),
            prepareRow: (row, i) => doc.font('Helvetica').fontSize(12),
        });

        doc.moveDown();

        // Table 2
        const table2 = {
            headers: ['Successful Scanned'],
            rows: []
        };

        results.filter(site => site.ssl && !site.mal).forEach(site => {
            table2.rows.push([site.name]);
        });

        doc.table(table2, {
            prepareHeader: () => doc.font('Helvetica-Bold'),
            prepareRow: (row, i) => doc.font('Helvetica').fontSize(12),
        });

        doc.end();
    });
};

//Second one using pdf-make
const generatePDFReport2 = async (userName, results, errors, outputPath = 'report.pdf') => {
    const fonts = {
        Roboto: {
            normal: 'node_modules/roboto-font/fonts/Roboto/roboto-regular-webfont.ttf',
            bold: 'node_modules/roboto-font/fonts/Roboto/roboto-bold-webfont.ttf',
            italics: 'node_modules/roboto-font/fonts/Roboto/roboto-italic-webfont.ttf',
            bolditalics: 'node_modules/roboto-font/fonts/Roboto/roboto-bolditalic-webfont.ttf'
        }
    };

    const printer = new PdfPrinter(fonts);

    const docDefinition = {
        content: [
            { text: 'Website Scan Report', style: 'header' },
            { text: `User: ${userName}`, style: 'subheader' },
            { text: ' ', style: 'spacing' },
            {
                table: {
                    headerRows: 1,
                    widths: ['*', '*', '*'],
                    body: [
                        [{ text: 'Sites without SSL', style: 'tableHeader' }, { text: 'Malware Detected Sites', style: 'tableHeader' }, { text: 'Sites with Errors', style: 'tableHeader' }],
                        ...results.map(site => [
                            site.ssl ? '' : site.name,
                            site.mal ? site.name : '',
                            ''
                        ]),
                        ...errors.map(error => [
                            '', '', error.name
                        ])
                    ]
                },
                layout: {
                    fillColor: (rowIndex) => {
                        return (rowIndex === 0) ? '#1a73e8' : null;
                    },
                    hLineColor: () => '#007bff',
                    vLineColor: () => '#007bff',
                }
            },
            { text: ' ', style: 'spacing' },
            {
                table: {
                    headerRows: 1,
                    widths: ['*'],
                    body: [
                        [{ text: 'Successful Scanned', style: 'tableHeader' }],
                        ...results.filter(site => site.ssl && !site.mal).map(site => [site.name])
                    ]
                },
                layout: {
                    fillColor: (rowIndex) => {
                        return (rowIndex === 0) ? '#1a73e8' : null;
                    },
                    hLineColor: () => '#007bff',
                    vLineColor: () => '#007bff',
                }
            }
        ],
        styles: {
            header: {
                fontSize: 18,
                bold: true,
                alignment: 'center',
                color: '#007bff'
            },
            subheader: {
                fontSize: 14,
                bold: true,
                color: '#007bff'
            },
            tableHeader: {
                bold: true,
                fontSize: 13,
                color: 'white',
                fillColor: '#1a73e8',
                alignment: 'center'
            },
            spacing: {
                margin: [0, 10, 0, 10]
            }
        },
        defaultStyle: {
            font: 'Roboto'
        }
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const writeStream = fs.createWriteStream(outputPath);

    pdfDoc.pipe(writeStream);
    pdfDoc.end();

    return new Promise((resolve, reject) => {
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
    });
};



handlebars.registerHelper('not', function (value) {
    return !value;
});

handlebars.registerHelper('and', function (a, b) {
    return a && b;
});

const generatePDFReport3 = async (userName, results, errors, templatePath, outputPath) => {
    const htmlTemplate = fs.readFileSync(templatePath, 'utf-8');
    const template = handlebars.compile(htmlTemplate);

    const html = template({ userName, results, errors });

    return new Promise((resolve, reject) => {
        pdf.create(html, {
            childProcessOptions: {
                env: {
                    OPENSSL_CONF: '/dev/null',
                },
            },
        }).toFile(outputPath, (err, res) => {
            if (err) {
                return reject(err);
            }
            resolve(res.filename);
        });
    });
}

const generatePDFReport4 = async (userName, results, errors, templatePath, outputPath) => {
    const htmlTemplate = fs.readFileSync(templatePath, 'utf-8');
    const template = handlebars.compile(htmlTemplate);
    const html = template({ userName, results, errors });

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html);
    await page.pdf({ path: outputPath, format: 'A4' });

    await browser.close();
}


const generatePDFReportWithJsPDF = async (userName, results, errors, templatePath, outputPath) => {
    const htmlTemplate = fs.readFileSync(templatePath, 'utf-8');
    const template = handlebars.compile(htmlTemplate);

    const html = template({ userName, results, errors });

    // Launch puppeteer to render HTML content
    const browser = await puppeteer.launch({
        headless: true,
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'domcontentloaded' });

    // Wait for html2canvas to load
    await page.addScriptTag({ path: path.join(__dirname, 'assets', 'html2canvas.min.js') });

    // Generate the PDF using html2canvas and jsPDF
    const pdfBuffer = await page.evaluate(async () => {
        const element = document.body;
        const canvas = await html2canvas(element);
        const imgData = canvas.toDataURL('image/png');

        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'pt',
            format: 'a4'
        });

        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        return pdf.output('arraybuffer');
    });

    await browser.close();

    fs.writeFileSync(outputPath, Buffer.from(pdfBuffer));
}

module.exports = {
    generatePDFReport,
    generatePDFReport2,
    generatePDFReport3,
    generatePDFReport4,
    generatePDFReportWithJsPDF
}