    // /routes/productRoutes.js

    const express = require('express');
    const { scrapeAndInsertProduct, getAllProducts,scrapeAndInsertProductcheerio } = require('../controllers/productController');
    const { getProductByIdOrAsin } = require('../controllers/productController');
    const { addItemToEbay } = require('../services/ebayService');

    const router = express.Router();
    router.post('/get-product', getProductByIdOrAsin);
     // POST route to scrape and insert product
    router.post('/scrape-product', scrapeAndInsertProduct);
    router.post('/scrape-products', scrapeAndInsertProductcheerio);
    
    router.post('/addProductToEbay', async (req, res) => {
        console.log('Request Body:', req.body); // Check if the payload is correctly parsed
    
        const item = req.body;
        if (!item || Object.keys(item).length === 0) {
            return res.status(400).send({ message: 'Invalid request: item data is required.' });
        }
    
        try {
            await addItemToEbay(item);
            res.status(200).send({ message: 'Product listed on eBay successfully' });
        } catch (error) {
            res.status(500).send({ message: 'Error listing product on eBay', error: error.message });
        }
    });
    
// router.post('/addProductToEbay', async (req, res) => {
//     const item = req.body; // Extract item data from the request body
    
//     try {
//         await addItemToEbay(item);
//         res.status(200).send({ message: 'Product listed on eBay successfully' });
//     } catch (error) {
//         res.status(500).send({ message: 'Error listing product on eBay', error: error.message });
//     }
// });
    // GET route to fetch all products
    router.get('/products', getAllProducts);

    module.exports = router;
