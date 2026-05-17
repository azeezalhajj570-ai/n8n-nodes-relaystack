import type { INodeProperties } from 'n8n-workflow';

export const instanceDescription: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['instance'],
      },
    },
    options: [
      {
        name: 'Create',
        value: 'create',
        description: 'Create a new messaging instance',
        action: 'Create an instance',
      },
      {
        name: 'List',
        value: 'list',
        description: 'List all instances',
        action: 'List instances',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get a single instance by name',
        action: 'Get an instance',
      },
      {
        name: 'Delete',
        value: 'delete',
        description: 'Delete an instance',
        action: 'Delete an instance',
      },
      {
        name: 'Connect',
        value: 'connect',
        description: 'Connect an instance',
        action: 'Connect an instance',
      },
      {
        name: 'Disconnect',
        value: 'disconnect',
        description: 'Disconnect an instance',
        action: 'Disconnect an instance',
      },
      {
        name: 'Get Status',
        value: 'status',
        description: 'Get connection status of an instance',
        action: 'Get instance status',
      },
      {
        name: 'Send Login Code',
        value: 'sendLoginCode',
        description: 'Send a login code to a phone number',
        action: 'Send a login code',
      },
      {
        name: 'Verify Code',
        value: 'verifyCode',
        description: 'Verify a login code (OTP)',
        action: 'Verify a login code',
      },
      {
        name: 'Verify Password',
        value: 'verifyPassword',
        description: 'Verify 2FA password',
        action: 'Verify a 2FA password',
      },
    ],
    default: 'create',
  },
  {
    displayName: 'Instance Name',
    name: 'instanceName',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['instance'],
        operation: ['create', 'get', 'delete', 'connect', 'disconnect', 'status', 'sendLoginCode', 'verifyCode', 'verifyPassword'],
      },
    },
    description: 'Name of the messaging instance',
  },
  {
    displayName: 'Phone Number',
    name: 'phoneNumber',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['instance'],
        operation: ['sendLoginCode'],
      },
    },
    placeholder: '+1234567890',
    description: 'Phone number in international format',
  },
  {
    displayName: 'Code',
    name: 'code',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['instance'],
        operation: ['verifyCode'],
      },
    },
    description: 'OTP code received via Telegram',
  },
  {
    displayName: '2FA Password',
    name: 'password',
    type: 'string',
    typeOptions: { password: true },
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['instance'],
        operation: ['verifyPassword'],
      },
    },
    description: 'Two-factor authentication password',
  },
];
