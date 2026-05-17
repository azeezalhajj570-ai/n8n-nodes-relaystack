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
    displayName: 'Instance Name',
    name: 'instanceName',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['chat'],
        operation: ['listChats', 'getChatMessages'],
      },
    },
    description: 'Name of the connected instance',
  },
  {
    displayName: 'Chat ID',
    name: 'chatId',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['chat'],
        operation: ['getChatMessages'],
      },
    },
    description: 'ID of the chat to fetch messages from',
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    typeOptions: {
      minValue: 1,
    },
    default: 20,
    displayOptions: {
      show: {
        resource: ['chat'],
        operation: ['getChatMessages'],
      },
    },
    description: 'Maximum number of messages to return',
  },
  {
    displayName: 'Offset',
    name: 'offset',
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
    description: 'Number of messages to skip for pagination',
  },
];
