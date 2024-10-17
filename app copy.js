// Import packages
const express = require("express");
const home = require("./routes/home");
const ebayRoutes =require('./routes/ebayRoutes.js'); // Import the eBay routes

require('dotenv').config(); // Load environment variables
 const productRoutes = require('./routes/productRoutes'); // Import routes
 const bodyParser = require('body-parser');

const cors = require('cors');

const app = express();
// const PORT = process.env.PORT || 3000;
 app.use(bodyParser.json()); // Middleware to parse JSON bodies

app.use(cors({
    origin: ['http://localhost:3000', 'https://amazon-frontend-dev-wcy6.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));
  
  
// Middlewares
app.use('/api', productRoutes);
app.get('/', (req, res) => {
    res.send('Welcome to the Amazon Product API!');
});
app.use('/api/ebay', ebayRoutes);

 

// Routes
app.use("/home", home);

// connection
const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Listening to port ${port}`));
