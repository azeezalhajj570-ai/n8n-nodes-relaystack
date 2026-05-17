import type { INodeProperties } from 'n8n-workflow';

export const eventDescription: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['event'],
      },
    },
    options: [
      {
        name: 'Set Webhook',
        value: 'setWebhook',
        description: 'Set webhook configuration for an instance',
        action: 'Set webhook',
      },
      {
        name: 'Get Webhook',
        value: 'getWebhook',
        description: 'Get current webhook configuration',
        action: 'Get webhook',
      },
      {
        name: 'Delete Webhook',
        value: 'deleteWebhook',
        description: 'Delete webhook configuration',
        action: 'Delete webhook',
      },
      {
        name: 'Test Webhook',
        value: 'testWebhook',
        description: 'Send a test event to the webhook',
        action: 'Test webhook',
      },
    ],
    default: 'setWebhook',
  },
  {
    displayName: 'Instance Name',
    name: 'instanceName',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['event'],
        operation: ['setWebhook', 'getWebhook', 'deleteWebhook', 'testWebhook'],
      },
    },
    description: 'Name of the connected instance',
  },
  {
    displayName: 'Webhook URL',
    name: 'webhookUrl',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['event'],
        operation: ['setWebhook'],
      },
    },
    description: 'URL to receive webhook events',
  },
  {
    displayName: 'Events',
    name: 'events',
    type: 'multiOptions',
    displayOptions: {
      show: {
        resource: ['event'],
        operation: ['setWebhook'],
      },
    },
    options: [
      {
        name: 'Message Received',
        value: 'message_received',
        description: 'When a new message is received',
      },
      {
        name: 'Message Sent',
        value: 'message_sent',
        description: 'When a message is sent',
      },
      {
        name: 'Connection Status Changed',
        value: 'connection_state',
        description: 'When connection status changes',
      },
      {
        name: 'Authentication Required',
        value: 'auth_request',
        description: 'When authentication is needed',
      },
    ],
    default: ['message_received'],
    description: 'Event types to enable for the webhook',
  },
];
