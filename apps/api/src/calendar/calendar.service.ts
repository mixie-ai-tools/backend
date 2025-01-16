import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';

@Injectable()
export class CalendarService {
  private calendar;

  constructor() {
    // Create an authorized calendar client
    // In a real-world scenario, you’d use environment variables or a more secure way
    // of storing and accessing credentials.
    const auth = new google.auth.GoogleAuth({
      // Provide the path to your Google service account JSON key file OR the JSON directly
      keyFile: '.ignore/googlecalndar.json', 
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    this.calendar = google.calendar({ version: 'v3', auth });
  }

  async listCalendars(): Promise<any[]> {
    try {
      const response = await this.calendar.calendarList.list();

   
      // Extract calendar details from the response
      const calendars = response.data.items ?? [];
      return calendars.map((calendar) => ({
        id: calendar.id, // Calendar ID
        summary: calendar.summary, // Calendar name
        description: calendar.description, // Calendar description
        timeZone: calendar.timeZone, // Time zone of the calendar
      }));
    } catch (error) {
      console.error('Error fetching calendar list', error);
      throw error;
    }
  }

  /**
   * Check availability on a particular date and time.
   * This method uses the `freebusy` endpoint to see if the specified time range is free.
   *
   * @param date - The date in YYYY-MM-DD format (e.g. "2024-12-22")
   * @param startTime - Start time in HH:mm (24-hour) format (e.g. "09:00")
   * @param endTime - End time in HH:mm (24-hour) format (e.g. "10:00")
   * @returns A boolean indicating whether the calendar is free (true) or busy (false)
   */
  async checkAvailability(
    date: string,
    startTime: string,
    endTime: string
  ): Promise<boolean> {
    const startDateTime = new Date(`${date}T${startTime}:00Z`).toISOString();
    const endDateTime = new Date(`${date}T${endTime}:00Z`).toISOString();
  
    try {

        const events = await this.calendar.events.list({
            calendarId: 'primary', // Replace with your calendar ID
            timeMin: '2024-12-24T17:00:00Z', // Start time in UTC
            timeMax: '2024-12-24T23:30:00Z', // End time in UTC
            singleEvents: true,
            orderBy: 'startTime',
          });
          
        //   console.log('Events:', JSON.stringify(events.data.items, null, 2));
          
      const response = await this.calendar.freebusy.query({
        requestBody: {
          timeMin: startDateTime,
          timeMax: endDateTime,
          items: [{ id: 'primary' }], // Replace with your calendar ID
        },
      });
 
      console.log(response.data.calendars)
  
      // Access the busy array for the specified calendar ID
      const busyPeriods = response.data.calendars?.['primary']?.busy ?? [];
  
      // If there are no busy periods, the calendar is available
      return busyPeriods.length === 0;
    } catch (error) {
      console.error('Error querying freebusy:', error);
      throw error;
    }
  }
  
}
