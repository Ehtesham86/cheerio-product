// services/ebayService.js
const axios = require('axios');

// Function to create XML payload
const createEbayXML = (item) => {
    // Convert item data to XML format for eBay API
    return `<?xml version="1.0" encoding="utf-8"?>
    <AddFixedPriceItemRequest xmlns="urn:ebay:apis:eBLBaseComponents">
        <RequesterCredentials>
            <eBayAuthToken>${process.env.EBAY_USER_TOKEN}</eBayAuthToken>
        </RequesterCredentials>
        <Item>
            <Title>${item.title}</Title>
            <Description>${item.description}</Description>
                        <StartPrice>${item.startPrice}</StartPrice>  <!-- Ensure this is correctly formatted -->

             <CategoryID>1234</CategoryID> <!-- Change to your category ID -->
            <ConditionID>1000</ConditionID> <!-- Example for New condition -->
            <SKU>${item.sku}</SKU>
            <PictureURL>${item.images.join('</PictureURL><PictureURL>')}</PictureURL>
            <ItemSpecifics>
                <NameValueList>
                    <Name>Merchant Name</Name>
                    <Value>${item.merchantname || 'Default Merchant'}</Value>
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

const addItemToEbay = async (item) => {
    const xmlPayload = createEbayXML(item); // Convert item to XML payload
    
    try {
        const response = await axios.post('https://api.sandbox.ebay.com/ws/api.dll', xmlPayload, {
            headers: {
                'X-EBAY-API-COMPATIBILITY-LEVEL': '967',
                'X-EBAY-API-DEV-NAME': process.env.EBAY_DEV_ID,
                'X-EBAY-API-APP-NAME': process.env.EBAY_APP_ID,
                'X-EBAY-API-CERT-NAME': process.env.EBAY_CERT_ID,
                'X-EBAY-API-IAF-TOKEN': process.env.EBAY_USER_TOKEN,
                'X-EBAY-API-CALL-NAME': 'AddFixedPriceItem',
                'X-EBAY-API-SITE-ID': '0',
                'Content-Type': 'text/xml',
            },
        });
        console.log('Item added successfully:', response.data);
    } catch (error) {
        console.error('Error adding item:', error.response.data);
        throw new Error(error.response.data);
    }
};

module.exports = { addItemToEbay };
