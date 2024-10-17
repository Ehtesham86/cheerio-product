// /controllers/productController.js

const ProductModel = require('../models/productModel');
const { scrapeProductData } = require('../scraper/amazonScraper');

 // Handle scraping and inserting product
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

        const insertedData = await ProductModel.insertProduct(productData); // Insert data into Supabase
        res.status(200).json({ message: 'Product inserted successfully', data: insertedData });
        console.log('Product added successfully:', insertedData);
    }
    catch (error) {
        // Create a single error response object
        const errorResponse = {
            message: error.message, // Provide the error message
            // Optionally include stack trace if needed (remove in production for security)
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            // Include any other relevant error information here
        };
    
        // Send the error response only once
        res.status(500).json({ error: errorResponse });
    
        console.error(error); // Log the full error for server-side debugging
    }
};


// Handle fetching all products
const getAllProducts = async (req, res) => {
    try {
        const products = await ProductModel.fetchAllProducts(); // Fetch all products from Supabase
        res.status(200).json({ message: 'Products fetched successfully', data: products });
        console.log('Products fetched successfully:',products)
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log(error.message)

    }
};

// Get product by ID or ASIN
const getProductByIdOrAsin = async (req, res) => {
    try {
        const { id, asin } = req.body; // Get `id` or `asin` from the request body
        
        if (!id && !asin) {
            console.log('No ID or ASIN provided');
            return res.status(400).json({ error: 'Please provide either an id or asin.' });
        }

        // Call findByIdOrAsin from ProductModel
        const product = await ProductModel.findByIdOrAsin(id, asin);

        if (!product) {
            console.log('Product not found');
            return res.status(404).json({ message: 'Product not found' });
        }

        return res.status(200).json({ message: 'Product fetched successfully', data: product });
    } catch (err) {
        console.error('Error fetching product by ID or ASIN:', err.message);
        return res.status(500).json({ error: 'Server error: ' + err.message });
    }
};



 
module.exports = {getProductByIdOrAsin,
    scrapeAndInsertProduct,
    getAllProducts,
};
