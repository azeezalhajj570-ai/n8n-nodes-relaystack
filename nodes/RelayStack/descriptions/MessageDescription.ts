import type { INodeProperties } from 'n8n-workflow';

export const messageDescription: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['message'],
      },
    },
    options: [
      {
        name: 'Send Text',
        value: 'sendText',
        description: 'Send a text message to a chat',
        action: 'Send a text message',
      },
    ],
    default: 'sendText',
  },
  {
    displayName: 'Instance ID',
    name: 'instanceId',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['message'],
        operation: ['sendText'],
      },
    },
    description: 'UUID of the connected instance',
  },
  {
    displayName: 'Chat ID',
    name: 'chatId',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['message'],
        operation: ['sendText'],
      },
    },
    placeholder: 'e.g. 123456789 or @username or +1234567890',
    description: 'Chat ID (numeric), @username, or phone number of the target',
  },
  {
    displayName: 'Text',
    name: 'text',
    type: 'string',
    typeOptions: {
      rows: 4,
    },
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['message'],
        operation: ['sendText'],
      },
    },
    description: 'Message text content',
  },
];
