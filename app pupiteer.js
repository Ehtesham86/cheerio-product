// app.js

const express = require('express');
const puppeteer = require('puppeteer-core');
// const chromium = require("@sparticuz/chromium");
const chromium = require('chrome-aws-lambda');

// Initialize express app
const app = express();
app.use(express.json());

// Product Model (mocked for demonstration)
const ProductModel = {
  insertProduct: async (productData) => {
    // Simulate inserting into a database (replace with real DB logic)
    return Promise.resolve({ id: 1, ...productData });
  }
};

// Scraper function
const scrapeProductData = async (asin) => {
  const browser = await puppeteer.launch({
    executablePath: await process.platform === 'win32' 
      ? 'C:/Program Files/Google/Chrome/Application/Chrome.exe' 
      : chromium.executablePath,
    args: chromium.args,
    headless: chromium.headless,
    ignoreHTTPSErrors: true,
    defaultViewport: chromium.defaultViewport,
  });
  
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3');
  
  const url = `https://www.amazon.com/dp/${asin}`;
  
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    const productData = await page.evaluate(() => {
      const getElementText = (selector) => {
        const element = document.querySelector(selector);
        return element ? element.innerText.trim() : null;
      };

      const getElementValue = (selector) => {
        const element = document.querySelector(selector);
        return element ? element.value : null;
      };

      const asin = window.location.href.split('/dp/')[1]?.split('/')[0];
      const title = getElementText('#productTitle');
      const priceText = getElementText('.a-price .a-offscreen');
      const price = priceText ? parseFloat(priceText.replace(/[^0-9.-]+/g, '')) : null;
      const images = Array.from(document.querySelectorAll('#altImages img')).map(img => img.src);

      return {
        asin,
        adid: getElementValue('#adId'),
        sku: getElementValue('#sku'),
        merchantcustomerid: getElementValue('#merchantCustomerID'),
        merchantname: getElementText('#merchantName'),
        price,
        title,
        images,
      };
    });

    await browser.close();
    return productData;
  } catch (error) {
    console.error('Error navigating to the page or scraping:', error);
    await browser.close();
    throw new Error('Failed to scrape product data');
  }
};

// Controller function to handle scraping and inserting product
const scrapeAndInsertProduct = async (req, res) => {
  try {
    const asin = req.body.asin; // Expect ASIN from request body
    const productData = await scrapeProductData(asin); // Scrape product details

    // Log the scraped product data to verify its structure
    console.log('Scraped Product Data:', productData);

    // Check if required fields are present
    if (!productData.title) {
      throw new Error("Product title is missing");
    }

    const insertedData = await ProductModel.insertProduct(productData); // Insert data into Supabase or your DB
    res.status(200).json({ message: 'Product inserted successfully', data: insertedData });
    console.log('Product added successfully:', insertedData);
  }
  catch (error) {
    // Create a single error response object
    const errorResponse = {
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    };
    
    // Send the error response
    res.status(500).json({ error: errorResponse });
    console.error(error); // Log the full error for server-side debugging
  }
};

// Routes
app.post('/scrape-product', scrapeAndInsertProduct);

// Start the server
const port = process.env.PORT || 9001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
