# Message Service

This directory contains the message service for sending SMS/WhatsApp messages using MSG91.

## Files

- `message-service.ts`: The main message service implementation

## Usage

### In Server Components or Server Actions

```typescript
import { messageService } from '@/lib/message-service';

// In a server component or server action
export async function sendEventNotification(eventData) {
  'use server'; // If used in a server action
  
  const result = await messageService.sendMessage({
    mobiles: eventData.participantMobile, // Mobile number (with or without country code)
    part_name: eventData.participantName, // Participant name
    event_name: eventData.eventName, // Event name
    part_id: eventData.entryId // Event entry ID
  });
  
  return result.success;
}
```

### Direct Usage Example

```typescript
import { messageService } from '@/lib/message-service';

// Send a message
const result = await messageService.sendMessage({
  mobiles: '9426981195', // Mobile number (with or without country code)
  part_name: 'John Doe', // Participant name
  event_name: 'Event 1', // Event name
  part_id: 'entry123' // Event entry ID
});

// Check the result
if (result.success) {
  console.log('Message sent successfully!');
} else {
  console.error('Failed to send message:', result.error);
}
```

## Configuration

The message service is configured using environment variables:

- `MSG91_URL`: The URL of the MSG91 API (default: `https://control.msg91.com/api/v5/flow`)
- `MSG91_AUTHKEY`: The authentication key for the MSG91 API
- `MSG91_TEMPLATE_ID`: The default template ID to use for messages

These variables should be set in the `.env` file.

## Database

All messages sent are logged in the `message_logs` table in the database. The table has the following structure:

- `id`: UUID (primary key)
- `template_id`: The template ID used for the message
- `recipient_mobile`: The mobile number of the recipient
- `event_id`: The ID of the event (if applicable)
- `event_entry_id`: The ID of the event entry (if applicable)
- `message_variables`: The variables used in the message template (JSON)
- `status`: The status of the message (success, error, etc.)
- `response_data`: The response data from the MSG91 API (JSON)
- `error_message`: The error message (if any)
- `created_at`: The timestamp when the message was created
- `updated_at`: The timestamp when the message was last updated 