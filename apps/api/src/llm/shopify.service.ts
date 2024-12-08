// src/shopify/shopify.service.ts
import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ShopifyService {
  private readonly shopName: string;
  private readonly accessToken: string;

  constructor() {
    this.shopName = process.env.SHOPIFY_SHOP_NAME || '';
    this.accessToken = process.env.SHOPIFY_ACCESS_TOKEN || '';
  }

  async fetchProducts(): Promise<any> {
    try {
      const url = `https://${this.shopName}.myshopify.com/api/2024-01/graphql.json`;
      const headers = {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': this.accessToken,
      };
      const query = `
        query {
          products(first: 2) {
            edges {
              node {
                id
                title
                description
              }
            }
          }
        }
      `;

      const response = await axios.post(url, { query }, { headers });
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error('Failed to fetch products from Shopify');
    }
  }
}
