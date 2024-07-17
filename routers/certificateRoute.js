import express from 'express';
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
            type: "service_account",
            project_id: "tutedute",
            private_key_id: "db7e77fe92d14d6c201eec501a1599e34b7c8e82",
            private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCmv2fnGf7xo5ec\nTbhKLGS4FitkBdRSuOHwnm/KiWe+Pg1Eq5DhbAwPKH34uAC4TZcxF/SWEp8tgYeT\n3tf8tYi+zUQUHPV8mLsTff8Hs2h/21KulotgqCizEJaVzDgLw0uBn1s/+vQI+Miy\nUMtKiynweOb31yXyXVTnvh6k+Kx+6KeddVEltjDuWq5bK+bBrG6LJZx1MStwodOC\nhTVWe8/dWlz0DBunLfwvy6MPSrn/W89H9LSb2TMogPteYp8qFCWmSu5RemLH9c9i\nMSUmKNWx2ONpejW9hMnRmrdxB+1C86EHyFNVZG7DK1Psd9cmgG1tJoLWQkeMcYAu\nheCoh6apAgMBAAECggEAAWTK0PVOsPua1oc8rCvW+Cxt3RDigehlpNtk9Q9x5un+\nT6WzXDtivISZJllR+GuXZ2VE1oIt/MU1dxFdfHFFsc2SqfkSsRswMug8BIpI+QrO\n4NXYiqMBLkgsIz3XaPuPOVR109D/yOyDNe1W5togrFZAXPYz02s/b+ciIUm3gse6\nbftwm4WN1+A8fhIhvAG70wP0ETqjGDLVOSKPZlGFXYRFINApMrTzp1nw+mwGOmDK\nlsrMms9x+xi6bWzin6iXGkLS5lUAatpgz9p2XrYr8iJyusmwet+WBBnmCGD78pcF\nTXdRT0yvObw2GiC/iXCGpRLCkbpk7Dz6/l9qZzAWcQKBgQDdkN4wzQhFtn/GyzL1\nQJbemi8szF4QEKKuicmXZ3XBAr5RvY/Id5o5BNYEe8TESwoQD6USKUWd/eXfXPVp\nWdUtGvzGpcd+z1VPMMNAWAIz5NJ0ey+ClX9JXBZ1viruL9Lo6L5bvYMBhuNXDpLP\nQO9GKzZy0PYFbLJ8WCk22CmYeQKBgQDAqY/+EqpoICKcLSEY+hVHbt07IFuYg2uX\n6CNi6wGsLgac0nSbx5TPGGh9okdM6+mjR8kiUgaisC466DgV0J0E1bG9voJAd+Ma\nJSxoZgHHRHJBQR6t5IqDX9A1LzRIuo6tZt9DWoVWF7qxIHfFM1y/ded9g3aNd9/O\nx8+/KIZTsQKBgQDFUMpPM4j2bHyGkVekSg0R2MXCY44xSF9YiKTbDOw1IzhSmzp9\nEOZreP8PpxmophskCoq7Db5N4Vrh/GshkzrhnHMYhXKQYBxdFdQMbVQo2tMBoOLC\nrFhbAIOP//dDf5uYiA1erfsJVRMI6JWdtPphxwIKZkVyt0aMrgamLQN+IQKBgBJN\niYJnn4y40NDpcKWAzJi2rYm6bzkz8vrBcOsqzEPhM3ueerl54mcyOGsHCaMDHnUG\nktMR29OEzT+HZByebuxQqMwP1yvst8R6F5fraOvXUstkNlfqyEXmyk7jJyJpprhO\nd5NcfCJLqs68+OPhF0SRHObNoGucIcTxMolEfk5hAoGAPLoOfUaGc1IB5a7Laef4\nkI2koMgJafavia6joXV+SEiknEgOTDkGV6yQqQC8BYUfT8C+Lfbcf+QNa6q80lPl\n+bipfZd+vkUZA9kv1qTc0CM3tut4jXasDb5RTF8jT4qbgROljbQYCa6BCPyQddPS\nuarw5O8UFyjVUvhcfMDeMMs=\n-----END PRIVATE KEY-----\n",
            client_email: "tutedute@tutedute.iam.gserviceaccount.com",
            client_id: "113142431559446377739",
            auth_uri: "https://accounts.google.com/o/oauth2/auth",
            token_uri: "https://oauth2.googleapis.com/token",
            auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
            client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/tutedute%40tutedute.iam.gserviceaccount.com"
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
