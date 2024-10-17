const { createClient } = require('@supabase/supabase-js');
 
// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL; // Supabase URL from .env
const supabaseKey = process.env.SUPABASE_KEY; // Supabase Key from .env
// const supabase = createClient(supabaseUrl, supabaseKey);
const supabase = createClient(supabaseUrl, supabaseKey, {
    headers: {
      'X-Client-Info': 'supabase-js-node/2.45.4',
    }
  });
  

const ProductModel = {
    // Function to insert a product
    async insertProduct(productData) {
        try {
            const { data, error } = await supabase
                .from('products')
                .insert([productData])
                .select(); // Ensure returning data

            if (error) {
                console.error('Error inserting product:', error.message);
                throw new Error('Error inserting product: ' + error);
            }

            return data; // Return inserted product data
        } catch (error) {
            throw new Error(error);
        }
    },

    // Function to fetch all products
    async fetchAllProducts() {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*'); // Fetch all rows

            if (error) {
                console.error('Error fetching products:', error.message);
                throw new Error('Error fetching products: ' + error.message);
            }

            return data;
        } catch (error) {
            throw new Error(error.message);
        }
    },

    // Function to fetch a product by ID or ASIN
    async findByIdOrAsin(id, asin) {
        let query;

        if (id) {
            console.log(`Searching by id: ${id}`);
            query = supabase.from('products').select('*').eq('id', id);
        } else if (asin) {
            console.log(`Searching by asin: ${asin}`);
            query = supabase.from('products').select('*').eq('asin', asin);
        }

        try {
            const { data, error } = await query;

            if (error) {
                console.error('Error fetching product:', error.message);
                throw new Error('Error fetching product');
            }

            if (!data || data.length === 0) {
                console.log('No product found');
                return null; // No product found
            }

            console.log('Product found:', data[0]);
            return data[0]; // Return the first match
        } catch (error) {
            console.error('Error during product search:', error.message);
            throw new Error(error.message);
        }
    }
};

module.exports = ProductModel;
