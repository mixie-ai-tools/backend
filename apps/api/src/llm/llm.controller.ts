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
    try {
      return await this.chatService.getAllChats();
    } catch (error) {
      Logger.log(error);
    }
  }


  @Get('/chats/:conversationId')
  async getChatById(@Param('conversationId') conversationId: string) {
    try {

      return await this.chatService.getAllChatById(conversationId);
    } catch (error) {
      Logger.log(error);
    }
  }


  @Put('/chats/:conversationId')
  async updateChatById(@Param('conversationId') conversationId: string, @Body() updateChatDto: UpdateChatDto) {
    try {
      const assistant = await this.lmStudioService.similaritySearch(updateChatDto, 5);
      updateChatDto.chatBlob.push({
        assistant: assistant.content
      });

     return  await this.chatService.updateChatById(conversationId, updateChatDto);

    } catch (error) {
      Logger.log(error);
    }
  }


  @Post('/chats')
  async createChat(@Body() chatData: CreateChatDto) {
    try {
      return await this.chatService.createChat(chatData)
    } catch (error) {
      Logger.log(error);
    }

  }


  @Get('process')
  async processDocs() {
    try {
      const products = await this.shopifyService.fetchProducts();
      const productsData = products.data.products.edges;
      return await this.lmStudioService.addShopifyProductsToVectorStore(productsData);
    } catch (error) {
      Logger.log(error);
    }

  }
}
