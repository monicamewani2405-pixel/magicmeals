/**
 * Shopify Headless Configuration for Magic Meals
 * 
 * Instructions:
 * 1. Keep your secret Admin API keys private. Only paste your PUBLIC Storefront API Access Token here.
 * 2. Store domain is pre-filled: 1z10zd-y0.myshopify.com
 * 3. As you add products in Shopify, paste their numerical Variant IDs into productVariantMapping below.
 */

window.SHOPIFY_CONFIG = {
  // Your myshopify.com domain (from your admin URL)
  shopDomain: '1z10zd-y0.myshopify.com',

  // PASTE YOUR PUBLIC STOREFRONT API ACCESS TOKEN HERE:
  storefrontAccessToken: 'c490756ca639d9a1a1ea506ff0631bc0',

  // Storefront API version
  apiVersion: '2024-01',

  // Optional: Map your website product IDs to Shopify Variant IDs (numerical or gid format)
  // Example: 'rajma-masala': '47182918291029' (Find variant ID in Shopify Admin > Products > Edit variant > URL)
  productVariantMapping: {
    'rajma-masala': '',
    'dal-khichdi': '',
    'paneer-butter-masala': '',
    'dal-makhani': '',
    'pav-bhaji': '',
    'veg-biryani': '',
    'kanda-poha': '',
    'idli-sambar': '',
    'masala-khichdi-kadhi': '',
    'fried-rice-manchurian': '',
    'pind-ke-chhole': '',
    'authentic-gujarati-thepla': '',
    'tomato-soup': '',
    'gajar-halwa': '',
    'aam-ras': '',
    'punjabi-comfort-combo': '',
    'mumbai-street-combo': '',
    'gujarati-delight-combo': '',
    'travelers-survival-kit': '',
    'healthy-comfort-combo': '',
    'dessert-duo': '',
    'family-feast-box': ''
  }
};
