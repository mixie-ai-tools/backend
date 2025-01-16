import { Controller, Get, Query } from '@nestjs/common';
import { CalendarService } from './calendar.service';

@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get('availability')
  async getAvailability(
    @Query('date') date: string,
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
  ) {
    // Validate the query parameters as needed (e.g. via DTOs or Pipes)
    const isAvailable = await this.calendarService.checkAvailability(
      date,
      startTime,
      endTime,
    );

    return {
      date,
      startTime,
      endTime,
      isAvailable,
    };
  }

  @Get('list')
  async listCalendars() {
    const calendars = await this.calendarService.listCalendars();
    return calendars;
  }
}
