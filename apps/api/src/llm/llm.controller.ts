import { Controller, Get, Logger, Post, Body, Param, Put } from '@nestjs/common';
import { LlmService } from '@/api/src/llm/llm.service';
import { LlmQueryDto } from '@app/common/dtos';
import { LmStudioEmbeddingsService } from '@/api/src/llm/lmstudio.service';
import { ShopifyService } from './shopify.service';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/chat-create.dto';
import { UpdateChatDto } from './dto/chat-update.dto';

@Controller('llm')
export class LlmController {
  constructor(
    private readonly llmService: LlmService,
    private readonly lmStudioService: LmStudioEmbeddingsService,
    private readonly shopifyService: ShopifyService,
    private readonly chatService: ChatsService
  ) { }

  @Get('/chats')
  async getChats() {
    return await this.chatService.getAllChats();
  }


  @Get('/chats/:conversationId')
  async getChatById(@Param('conversationId') conversationId: string) {
    return await this.chatService.getAllChatById(conversationId)
  }


  @Put('/chats/:conversationId')
  async updateChatById(@Param('conversationId') conversationId: string, @Body() updateChatDto: UpdateChatDto) {
    return await this.chatService.updateChatById(conversationId, updateChatDto)
  }


  @Post('/chats')
  async createChat(@Body() chatData: CreateChatDto){
    return await this.chatService.createChat(chatData)
  }

  @Get('/search')
  async search() {
    return await this.lmStudioService.similaritySearch('What is the name of the stuffed panda?', 5);
  }

  @Get('process')
  async processDocs() {
    try {
      const products = await this.shopifyService.fetchProducts();
      const productsData = products.data.products.edges;
      return await this.lmStudioService.addShopifyProductsToVectorStore(productsData);
    } catch (e) {
      Logger.log(e)
    }

  }
}
