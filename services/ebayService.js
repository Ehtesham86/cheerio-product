// services/ebayService.js
const axios = require('axios');

// Select the correct eBay API URL based on the environment
const ebayApiUrl = process.env.EBAY_ENVIRONMENT === 'production'
  ? 'https://api.ebay.com/ws/api.dll'
  : 'https://api.sandbox.ebay.com/ws/api.dll';

// Function to escape XML special characters
 
const escapeXML = (unsafe) => {
    // Check if unsafe is a string, if not return an empty string
    if (typeof unsafe !== 'string') {
        return ''; // or handle as needed, e.g., throw an error
    }
    
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
};
// Function to create the eBay XML request for adding a fixed-price item
// Function to create the eBay XML request for adding a fixed-price item
const createEbayXML = (item) => {
    console.log('Creating eBay XML for item:', process.env.EBAY_USER_TOKEN);
  
    // Set default values for missing properties
    const title = item.title || '';
    const description = item.description || '';
    const startPrice = item.startPrice || '0.0';
    const sku = item.sku || '';
    const merchantname = item.merchantname || 'Default Merchant';
    const images = item.images || [];
  
    // Create the XML payload
    const imageXML = images.length > 0
      ? `<PictureURL>${images.map(image => escapeXML(image)).join('</PictureURL><PictureURL>')}</PictureURL>`
      : '';
  
    return `<?xml version="1.0" encoding="utf-8"?>
      <AddFixedPriceItemRequest xmlns="urn:ebay:apis:eBLBaseComponents">
 <RequesterCredentials>
    <eBayAuthToken>${process.env.EBAY_USER_TOKEN}</eBayAuthToken>
</RequesterCredentials>

          <Item>
              <Title>${escapeXML(title)}</Title>
              <Description>${escapeXML(description)}</Description>
              <StartPrice>${startPrice}</StartPrice>
              <CategoryID>1234</CategoryID> <!-- Change to your category ID -->
              <ConditionID>1000</ConditionID> <!-- Example for New condition -->
              <SKU>${escapeXML(sku)}</SKU>
              ${imageXML}
              <ItemSpecifics>
                  <NameValueList>
                      <Name>Merchant Name</Name>
                      <Value>${escapeXML(merchantname)}</Value>
                  </NameValueList>
              </ItemSpecifics>
              <ShippingDetails>
                  <ShippingType>Flat</ShippingType>
                  <ShippingServiceOptions>
                      <ShippingService>USPSPriority</ShippingService>
                      <ShippingServiceCost>5.00</ShippingServiceCost>
                  </ShippingServiceOptions>
              </ShippingDetails>
          </Item>
      </AddFixedPriceItemRequest>`;
  };
  
  // Function to add an item to eBay using the API
  const addItemToEbay = async (item, ebayAuthToken) => {
    if (!item || !item.title || !item.startPrice || !item.sku || !item.merchantname || !item.images) {
      throw new Error('Invalid item data');
    }
  
    console.log('Adding item to eBay:', item);
  
    // Create the XML payload for the request
    const xmlPayload = createEbayXML(item, ebayAuthToken);
  
    try {
      // Send the request to eBay API
      const response = await axios.post(ebayApiUrl, xmlPayload, {
        headers: {
          'X-EBAY-API-COMPATIBILITY-LEVEL': '967',
          'X-EBAY-API-DEV-NAME': process.env.EBAY_DEV_ID,
          'X-EBAY-API-APP-NAME': process.env.EBAY_APP_ID,
          'X-EBAY-API-CERT-NAME': process.env.EBAY_CERT_ID,
          'X-EBAY-API-CALL-NAME': 'AddFixedPriceItem',
          eBayAuthToken : process.env.EBAY_USER_TOKEN,
          'X-EBAY-API-SITEID': 0, // Set to correct eBay site ID (0 for US)
          'Content-Type': 'text/xml', // Change back to text/xml
        }
      });
  
      console.log('Item added successfully:', response.data);
      // console.log('Token being used:', process.env.EBAY_USER_TOKEN);
  
      return response.data;
  
    } catch (error) {
      if (error.response) {
        console.error('Error adding item:', error.response.data);
      } else {
        console.error('Error adding item:', error.message);
      }
      throw new Error(error.response?.data || error.message);
    }
  };
module.exports = {
  addItemToEbay
};