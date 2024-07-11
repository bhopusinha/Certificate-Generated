const express = require('express');
const router = express.Router();
const Certificate = require('../models/Certificate');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');
const { google } = require('googleapis');


// Helper function to generate PDF from npm googleapis
async function generatePDF(name, course, date) {
    const existingPdfBytes = fs.readFileSync('./template.pdf');
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

    
    const page = pdfDoc.getPage(0);

    
    const detailsFontSize = 17;
    const textFontSize = 48;

    
    const pageWidth = page.getWidth();
    const nameTextWidth = font.widthOfTextAtSize(name, textFontSize);
    const nameX = (pageWidth - nameTextWidth) / 2;

  
    page.drawText(name, {
        x: nameX,
        y: 373, 
        size: textFontSize,
        font: timesRomanFont,
        color: rgb(244 / 255, 210 / 255, 25 / 255),
    });

    
    const details = `For successfully completing the TuteDude ${course}\ncourse on ${date}.`;
    const detailsLines = details.split('\n');

    let y = 330; 

    detailsLines.forEach(line => {
        const textWidth = font.widthOfTextAtSize(line, detailsFontSize);
        const textX = (pageWidth - textWidth) / 2; 
        page.drawText(line, {
            x: textX - 5,
            y: y,
            size: detailsFontSize,
            font: boldFont,
            color: rgb(0, 0, 0),
        });
        y -= detailsFontSize + 10; 
    });
    
    const pdfBytes = await pdfDoc.save();

    
    const pdfPath = `./${name}_certificate.pdf`;
    fs.writeFileSync(pdfPath, pdfBytes);

    
    return pdfPath;
}

// Google Drive upload function
async function uploadToGoogleDrive(filePath,name) {
    const auth = new google.auth.GoogleAuth({
        credentials: {  /* Google drive upload keys */
            type: process.env.type,
            project_id: process.env.project_id,
            private_key_id: process.env.private_key_id,
            private_key: process.env.private_key,
            client_email: process.env.client_email,
            client_id: process.env.client_id,
            auth_uri: process.env.auth_uri,
            token_uri: process.env.token_uri,
            auth_provider_x509_cert_url: process.env.auth_provider_x509_cert_url,
            client_x509_cert_url: process.env.client_x509_cert_url
        },
        scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    const drive = google.drive({ version: 'v3', auth });
    const fileMetadata = {
        name: `${name}-certificate.pdf`,
        parents: ["1luE0KHxsh8kmXSpGs0XD-ufS2jjWTDtE"],
    };
    const media = {
        mimeType: 'application/pdf',
        body: fs.createReadStream(filePath),
    };

    const response = await drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id',
    });

    return `https://drive.google.com/file/d/${response.data.id}/view`;
}

router.post('/generate', async (req, res) => {
    const { name, course, date, email } = req.body;
    const pdfPath = await generatePDF(name, course, date);
    const pdfLink = await uploadToGoogleDrive(pdfPath,name);

    const certificate = new Certificate({ name, course, date, email, pdfLink });
    await certificate.save();

    res.status(201).send(certificate);
});

module.exports = router;
