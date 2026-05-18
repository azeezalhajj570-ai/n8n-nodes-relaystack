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
        description: 'Set webhook URL for an instance',
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
    displayName: 'Instance ID',
    name: 'instanceId',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['event'],
        operation: ['setWebhook', 'getWebhook', 'deleteWebhook', 'testWebhook'],
      },
    },
    description: 'UUID of the connected instance',
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
];
