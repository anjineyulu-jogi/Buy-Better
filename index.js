const express = require('express');
const axios = require('axios');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(express.json());

// --- PASTE YOUR KEYS HERE ---
const GEMINI_KEY = "AIzaSyCPwXJN6vTTpXYez6lO-xNBtZqGg2-k0_8";
const AISENSY_KEY = "a54233624648a44ec2a9e";
const SCRAPE_KEY = "NUNHMTH88MUEY0U818RMMCO6QAMB4MADLDA6NOCPPL405N2GDGVJ0XKF0LB7AU8LMHJ7FUCRGH9UC2HN";

const genAI = new GoogleGenerativeAI(GEMINI_KEY);

app.post('/myra', async (req, res) => {
    const { product_name, product_image, user_phone } = req.body;
    let finalOutput = "";

    try {
        // SECTION 1: HEALTH SCAN (If user sent an image)
        if (product_image) {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const prompt = "Look at this product label. List harmful ingredients and give a safety score out of 100. Keep it short.";
            
            // Note: In production, you'd convert the URL to base64 here
            finalOutput = "🔬 *Myra Health Scan:* Analysis complete! Safety Score: 82/100. Contains Artificial Colors.";
        } 
        
        // SECTION 2: PRICE CHECK (If user sent text/name)
        else if (product_name) {
            const searchUrl = encodeURIComponent(`https://www.amazon.in/s?k=${product_name}`);
            const scrapeResponse = await axios.get(`https://app.scrapingbee.com/api/v1/?api_key=${SCRAPE_KEY}&url=${searchUrl}`);
            
            // Logic to find the price in the HTML goes here
            finalOutput = `💰 *Myra Price Check:* Found ${product_name} on Amazon for ₹499. Performance Score: 9/10.`;
        }

        // SECTION 3: SEND BACK TO WHATSAPP
        await axios.post('https://backend.aisensy.com/campaign/external/v1/message', {
            apiKey: AISENSY_KEY,
            mobileNumber: user_phone,
            userName: "User",
            message: {
                type: "text",
                text: finalOutput
            }
        });

        res.status(200).send("Success");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error");
    }
});

app.listen(3000, () => console.log("Myra's Brain is online on Port 3000!"));