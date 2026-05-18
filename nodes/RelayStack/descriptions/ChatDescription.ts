import type { INodeProperties } from 'n8n-workflow';

export const chatDescription: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['chat'],
      },
    },
    options: [
      {
        name: 'List Chats',
        value: 'listChats',
        description: 'List all chats for an instance',
        action: 'List chats',
      },
      {
        name: 'Get Chat Messages',
        value: 'getChatMessages',
        description: 'Get messages from a specific chat',
        action: 'Get chat messages',
      },
    ],
    default: 'listChats',
  },
  {
    displayName: 'Instance ID',
    name: 'instanceId',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['chat'],
        operation: ['listChats', 'getChatMessages'],
      },
    },
    description: 'UUID of the connected instance',
  },
  {
    displayName: 'Chat ID',
    name: 'chatId',
    type: 'number',
    default: 0,
    required: true,
    displayOptions: {
      show: {
        resource: ['chat'],
        operation: ['getChatMessages'],
      },
    },
    description: 'Numeric ID of the chat to fetch messages from',
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    typeOptions: {
      minValue: 1,
      maxValue: 100,
    },
    default: 50,
    displayOptions: {
      show: {
        resource: ['chat'],
        operation: ['getChatMessages'],
      },
    },
    description: 'Maximum number of messages to return (max 100)',
  },
  {
    displayName: 'Offset Message ID',
    name: 'offsetId',
    type: 'number',
    typeOptions: {
      minValue: 0,
    },
    default: 0,
    displayOptions: {
      show: {
        resource: ['chat'],
        operation: ['getChatMessages'],
      },
    },
    description: 'Message ID to start from (pagination: returns messages older than this ID)',
  },
];
