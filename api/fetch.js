const axios = require('axios');
const { totp } = require('otplib');

export default async function handler(req, res) {
  
    const { file, otp } = req.query;

    if (!file || !otp) {
        return res.status(400).json({ error: "Missing parameters" });
    }

  
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const REPO_OWNER = process.env.REPO_OWNER; 
    const REPO_NAME = process.env.REPO_NAME;   
    const SHARED_SECRET = process.env.SHARED_SECRET; 

   
    
    totp.options = { step: 30, window: 1 }; 
    const isValid = totp.check(otp, SHARED_SECRET);

    if (!isValid) {
        console.error("❌ Unauthorized access attempt with invalid OTP");
        return res.status(403).json({ error: "Access Denied: Invalid Security Token" });
    }

    try {
       
        const githubUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${file}`;
        
        const response = await axios.get(githubUrl, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3.raw' 
            },
            responseType: 'text'
        });

     
        res.setHeader('Content-Type', 'text/plain');
        return res.status(200).send(response.data);

    } catch (error) {
        console.error("❌ GitHub Fetch Error:", error.message);
        return res.status(500).json({ error: "Could not fetch source from GitHub" });
    }
}
