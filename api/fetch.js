const speakeasy = require('speakeasy');
const path = require('path'); 

export default async function handler(req, res) {
    const { file, otp } = req.query;

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const REPO_OWNER = process.env.REPO_OWNER;
    const REPO_NAME = process.env.REPO_NAME;
    const SHARED_SECRET = process.env.SHARED_SECRET;

    // 🛡️ OTP පරීක්ෂාව
    const isValid = speakeasy.totp.verify({
        secret: SHARED_SECRET,
        encoding: 'ascii',
        token: otp,
        window: 1
    });

    if (!isValid) {
        return res.status(403).json({ error: "Unauthorized: Invalid OTP" });
    }

    try {
        
        if (!file) {
            const listUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/`;
            const response = await fetch(listUrl, {
                headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}` }
            });
            
            const data = await response.json();
            if (!Array.isArray(data)) throw new Error("GitHub error");

            
            const fileList = data.map(item => ({
                name: item.name,
                type: item.type 
            }));
            return res.status(200).json(fileList);
        }

     
        const fetchUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${file}`;
        const response = await fetch(fetchUrl, {
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3.raw' // Raw data 
            }
        });

        if (!response.ok) throw new Error("File not found");

        const ext = path.extname(file).toLowerCase();
        let contentType = 'text/plain';

        if (['.png', '.jpg', '.jpeg', '.gif'].includes(ext)) contentType = `image/${ext.replace('.', '')}`;
        else if (ext === '.mp4') contentType = 'video/mp4';
        else if (ext === '.pdf') contentType = 'application/pdf';
        else if (ext === '.json') contentType = 'application/json';

        // ⚠️ Binary Data විදියට ගන්න ඕන (ArrayBuffer)
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        res.setHeader('Content-Type', contentType);
        return res.status(200).send(buffer);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Sync Failed", details: error.message });
    }
}
