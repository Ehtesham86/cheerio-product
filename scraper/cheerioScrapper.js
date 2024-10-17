// /scraper/amazonScraper.js

const axios = require('axios');
const cheerio = require('cheerio');

// Function to scrape product data from Amazon by ASIN
const scrapeProductDatacheerio = async (asin) => {
    const url = `https://www.amazon.com/dp/${asin}`;

    try {
        // Fetch the page HTML using Axios
        const { data: html } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
            }
        });

        // Load HTML into Cheerio for parsing
        const $ = cheerio.load(html);

        // Extract product title and price
        const title = $('#productTitle').text().trim();
        const priceText = $('.a-price .a-offscreen').text().trim();
        const price = priceText ? parseFloat(priceText.replace(/[^0-9.-]+/g, '')) : null;

        // Extract product images
        const images = [];
        $('#altImages img').each((i, el) => {
            images.push($(el).attr('src'));
        });

        // Return the extracted product data
        return {
            asin,
            title,
            price,
            images,
        };
    } catch (error) {
        console.error('Error fetching or scraping product data:', error);
        throw new Error('Failed to scrape product data');
    }
};

// Export the scraper function
module.exports = {
    scrapeProductDatacheerio,
};
