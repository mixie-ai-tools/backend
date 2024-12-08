import { Controller, Get } from '@nestjs/common';
import { ShopifyService } from './shopify.service';

@Controller('shopify')
export class ShopifyController {
    constructor(private readonly shopifyService: ShopifyService) {}

    @Get('products')
    async getProducts () {
        try {
            const products = await this.shopifyService.fetchProducts();
            return products;
        }catch(e){
            throw new Error('failed to fetch products from Shopify');
        }
    }
}
