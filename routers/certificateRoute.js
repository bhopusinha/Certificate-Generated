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
async function uploadToGoogleDrive(filePath, name) {
    const auth = new google.auth.GoogleAuth({
        credentials: {  /* Google drive upload keys */
            type: "service_account",
            project_id: "tutedute",
            private_key_id: "078ea4a93d4d841fdeb2e03b4d7d0e80681c92c1",
            private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC6mB44L7g3y35j\nkB0rEywMGWUYzn4dF85ekAsGUb6FWPFhInF4ZUtGFXeJXqNrftQWlUYrh7YV6997\nR7Ow9TeqeOf9uWS5xICqL3do3eWzMfZ/iru2u1T2Dc2AYCWVpzQOUnZC/zVPMumd\nolWSch/YXAJ2xF+CIe3VEI25xVxRw6zGEEBraZqzSw9kVucIK7jx2qdb3jEdONKG\n1APHdn/57IR7zNivpTeu4DFLIiszmCVhviWoMnIpmTnZFKIOFKnG9Lad1CFLQRHw\nzR5UTUtZ6Q1Nkt4jN6Q3c8GA8Tp/4suIGk5y54uEhLP8nM5hrQ5wcpj12nqFl629\nSvcw2ZWHAgMBAAECggEALIYbv+BzHq0p7Wv36c1bV0+/9dlf8mU50wqf9tQOmBcP\nEdR8KvRQr9pzeY3hhMbwqKrZ4Y0yf6yW2P3U/Mamj8Dl6n8Qb9tZsEI/RgCczNOB\nNBHQlNvCfCvy+0z16u3I2BoJKhdniwxk/j48GQOuYZwi4mAdQhoCfDLE/qz/SGr1\nAVT04x40ChX1cOEfsIfs2tOlFTdRxiWfT+ug1xIpAE1RiKN87ohOHZV8tDJn1J7q\ny5XyFQohCyrRrNmueQyb+bGXSfxhmvb+QFEpHx73MOkpEBPqtKTvFsVxtO78Wt67\n2pMfMMZ7dbKZXlb2l1XcyfhSuspGJIPObrlQ7ARiwQKBgQD/PMSdF6DitW3k17Ou\nteVfjx7pxKZ9dIyhJs7WYda7NnHJpMoQBpqfDEjG9jySGjSElro5/DatXkjQQuiv\n9dW4B0q/eYSaRD/zpEx2GX0R/Y9epDMGc0NAFJhtjZ7cKiBukZU4MqVbvlcBvv4a\nVv1MbF4tDnDN15Lh9VPw0BqENwKBgQC7Jtg5JdS3M35Kjl0UedT6XBQsw6Pkz74D\nQDarPbJdOtBypa/CorwjhfMmdxfBpe7Z8z3YLMg7wL24VWNjCdJ9ezXI+/q8TqoC\nDgr2m0Qna7uT3AIgKoq9uD596v6H82vAgZYucreoF+5kErlfLD0IP2NIVErI466C\nNDXDEuZxMQKBgQCWX2PqtWgJCSDkiRyIWwv2/6gTy9LW6NqNewKzFVNgWtQxG5Ac\nXverqp4Z8ip/XUcBspem3+wKuhil8jWKrYgrcshcBKjWBk2zKmIN1jh0Z/GWraCO\nNUwyra+cI6qrRXp0Cfti75uycHJsSe0E8akr5FCbtP1KmK4lx9abcs+cgwKBgHDL\nwaf32BOukmBHG2x63VUjZ/lu1HnUh1YYPprIrZapGvbuS1dIk5Hpapn1TzkkVCfC\nBbUjkG8LBI1z0Vngkp+UQd9nl0AlPSvN4Oeuvs3vjXdZM2LFoSclQ2zK1CuGF5xH\nvgcyluRVwBVKf7UPyZ0N7z2pqAUZzJSm+PwgiQkRAoGBAI5Kkcg9G9/v9jjGGHBR\nB7/pyMuxfFnHwzl37FEmUIH6PAatkDbgYEAfZSvK99QdSOBVjHM2b+/gNQWGIO0I\nzO5uf52tK8AX0q5s4VdFYEdVJZAXrNxcWff0arLiae66avEE38ZDgu+1n7zdcJdM\nxarVEbQy5/LdgpUb4ooeS+p1\n-----END PRIVATE KEY-----\n",
            client_email: "tutedute@tutedute.iam.gserviceaccount.com",
            client_id: "101868881153948274020",
            auth_uri: "https://accounts.google.com/o/oauth2/auth",
            token_uri: "https://oauth2.googleapis.com/token",
            auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
            client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/tutedute%40tutedute.iam.gserviceaccount.com",
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
    const pdfLink = await uploadToGoogleDrive(pdfPath, name);

    const certificate = new Certificate({ name, course, date, email, pdfLink });
    await certificate.save();

    res.status(201).send(certificate);
});

module.exports = router;
