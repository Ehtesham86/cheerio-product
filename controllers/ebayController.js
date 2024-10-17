const axios = require('axios');
const { parseStringPromise } = require('xml2js');
require('dotenv').config();

const ebayApiUrl =
  process.env.EBAY_ENVIRONMENT === 'production'
    ? 'https://api.ebay.com/ws/api.dll'
    : 'https://api.sandbox.ebay.com/ws/api.dll';


 
 const listEbayItem = async (req, res) => {
  const item = req.body;
console.log(item,'++++listEbayItem')
  try {
    const xmlRequest = `
      <?xml version="1.0" encoding="utf-8"?>
      <AddFixedPriceItemRequest xmlns="urn:ebay:apis:eBLBaseComponents">
        <RequesterCredentials>
          <eBayAuthToken>${process.env.EBAY_USER_TOKEN}</eBayAuthToken>
        </RequesterCredentials>
        <ErrorLanguage>en_US</ErrorLanguage>
        <WarningLevel>High</WarningLevel>
        <Item>
          <Title>${item.title}</Title>
          <Description>${item.description || 'No description available.'}</Description>
          <PrimaryCategory>
            <CategoryID>9355</CategoryID> <!-- Replace with the appropriate category ID -->
          </PrimaryCategory>
          <StartPrice>${item.price}</StartPrice>
          <ConditionID>1000</ConditionID> <!-- 1000 = New -->
          <Country>US</Country>
          <Currency>USD</Currency>
          <DispatchTimeMax>3</DispatchTimeMax>
          <ListingDuration>GTC</ListingDuration>
          <ListingType>FixedPriceItem</ListingType>
          <PaymentMethods>PayPal</PaymentMethods>
          <PayPalEmailAddress>${process.env.PAYPAL_EMAIL}</PayPalEmailAddress>
          <PictureDetails>
            ${item.images
              .map((image) => `<PictureURL>${image}</PictureURL>`)
              .join('')}
          </PictureDetails>
          <PostalCode>95125</PostalCode>
          <Quantity>1</Quantity>
          <ReturnPolicy>
            <ReturnsAcceptedOption>ReturnsAccepted</ReturnsAcceptedOption>
            <RefundOption>MoneyBack</RefundOption>
            <ReturnsWithinOption>Days_30</ReturnsWithinOption>
            <ShippingCostPaidByOption>Buyer</ShippingCostPaidByOption>
          </ReturnPolicy>
          <ShippingDetails>
            <ShippingServiceOptions>
              <ShippingServicePriority>1</ShippingServicePriority>
              <ShippingService>USPSMedia</ShippingService>
              <ShippingServiceCost>0.00</ShippingServiceCost>
            </ShippingServiceOptions>
          </ShippingDetails>
          <Site>US</Site>
        </Item>
      </AddFixedPriceItemRequest>
    `;

    const headers = {
      'X-EBAY-API-CALL-NAME': 'AddFixedPriceItem',
      'X-EBAY-API-SITEID': '0',
      'X-EBAY-API-COMPATIBILITY-LEVEL': '967',
      'X-EBAY-API-DEV-NAME': process.env.EBAY_DEV_ID,
      'X-EBAY-API-APP-NAME': process.env.EBAY_APP_ID,
      'X-EBAY-API-CERT-NAME': process.env.EBAY_CERT_ID,
      'Content-Type': 'text/xml',
    };

    const response = await axios.post(ebayApiUrl, xmlRequest, { headers });

    const result = await parseStringPromise(response.data);
    const ack = result.AddFixedPriceItemResponse.Ack[0];

    if (ack === 'Success') {
      return res.status(200).json({
        message: 'Item listed successfully',
        itemId: result.AddFixedPriceItemResponse.ItemID[0],
      });
    } else {
      return res.status(400).json({
        message: 'Error listing item',
        errors: result.AddFixedPriceItemResponse.Errors,
      });
    }
  } catch (error) {
    console.error('Error listing item on eBay:', error);
    return res.status(500).json({ message: 'Server error', error });
  }
};
module.exports = {
    listEbayItem,
  };    