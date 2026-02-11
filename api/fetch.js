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
        // 🚀 1. ෆයිල් ලිස්ට් එක ගන්න අවස්ථාව (Recursive Trees API)
        if (!file) {
            const listUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/git/trees/main?recursive=1`;
            const response = await fetch(listUrl, {
                headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}` }
            });
            
            const data = await response.json();
            
            if (!data.tree) {
                throw new Error(data.message || "Failed to fetch GitHub tree");
            }

            // ෆෝල්ඩර්ස් නෙවෙයි, ෆයිල්ස් (blobs) වල path විතරක් ගන්නවා
            const filePaths = data.tree
                .filter(item => item.type === 'blob')
                .map(item => item.path);

            return res.status(200).json(filePaths);
        }

        // 📥 2. නිශ්චිත ෆයිල් එකක් බාන අවස්ථාව (Contents API)
        const fetchUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${file}`;
        const response = await fetch(fetchUrl, {
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3.raw'
            }
        });

        if (!response.ok) {
            return res.status(404).json({ error: "File not found on GitHub" });
        }

        // Content-Type එක තීරණය කිරීම
        const ext = path.extname(file).toLowerCase();
        let contentType = 'text/plain';
        if (['.png', '.jpg', '.jpeg', '.gif'].includes(ext)) contentType = `image/${ext.replace('.', '')}`;
        else if (ext === '.mp4') contentType = 'video/mp4';
        else if (ext === '.pdf') contentType = 'application/pdf';
        else if (ext === '.json') contentType = 'application/json';

        // Binary Data ලබා ගැනීම
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        res.setHeader('Content-Type', contentType);
        return res.status(200).send(buffer);

    } catch (error) {
        console.error("API Error:", error.message);
        return res.status(500).json({ error: "Sync Failed", details: error.message });
    }
}
