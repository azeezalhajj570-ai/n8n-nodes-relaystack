import type { IDataObject, IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';
import { instanceDescription } from './descriptions/InstanceDescription';
import { messageDescription } from './descriptions/MessageDescription';
import { chatDescription } from './descriptions/ChatDescription';
import { eventDescription } from './descriptions/EventDescription';
import { relayStackApiRequest } from './GenericFunctions';

export class RelayStack implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'RelayStack',
    name: 'relayStack',
    icon: 'file:relaystack.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
    description: 'Interact with Telegram API Gateway',
    defaults: {
      name: 'RelayStack',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'relayStackApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Instance',
            value: 'instance',
          },
          {
            name: 'Message',
            value: 'message',
          },
          {
            name: 'Chat',
            value: 'chat',
          },
          {
            name: 'Event',
            value: 'event',
          },
        ],
        default: 'instance',
      },
      ...instanceDescription,
      ...messageDescription,
      ...chatDescription,
      ...eventDescription,
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    const resource = this.getNodeParameter('resource', 0) as string;
    const operation = this.getNodeParameter('operation', 0) as string;

    for (let i = 0; i < items.length; i++) {
      try {
        let responseData;

        if (resource === 'instance') {
          responseData = await executeInstanceOperation.call(this, operation, i);
        } else if (resource === 'message') {
          responseData = await executeMessageOperation.call(this, operation, i);
        } else if (resource === 'chat') {
          responseData = await executeChatOperation.call(this, operation, i);
        } else if (resource === 'event') {
          responseData = await executeEventOperation.call(this, operation, i);
        } else {
          throw new Error(`Resource "${resource}" is not supported`);
        }

        returnData.push({ json: responseData || {} });
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({ json: { error: (error as Error).message } });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}

async function executeInstanceOperation(
  this: IExecuteFunctions,
  operation: string,
  itemIndex: number,
) {
  switch (operation) {
    case 'create': {
      const instanceName = this.getNodeParameter('instanceName', itemIndex) as string;
      return relayStackApiRequest.call(this, {
        method: 'POST',
        endpoint: '/instances',
        body: { name: instanceName },
      });
    }

    case 'list':
      return relayStackApiRequest.call(this, {
        method: 'GET',
        endpoint: '/instances',
      });

    case 'get': {
      const instanceId = this.getNodeParameter('instanceId', itemIndex) as string;
      return relayStackApiRequest.call(this, {
        method: 'GET',
        endpoint: `/instances/${instanceId}`,
      });
    }

    case 'delete': {
      const instanceId = this.getNodeParameter('instanceId', itemIndex) as string;
      return relayStackApiRequest.call(this, {
        method: 'DELETE',
        endpoint: `/instances/${instanceId}`,
      });
    }

    case 'connect': {
      const instanceId = this.getNodeParameter('instanceId', itemIndex) as string;
      return relayStackApiRequest.call(this, {
        method: 'POST',
        endpoint: `/instances/${instanceId}/auth/connect`,
      });
    }

    case 'disconnect': {
      const instanceId = this.getNodeParameter('instanceId', itemIndex) as string;
      return relayStackApiRequest.call(this, {
        method: 'POST',
        endpoint: `/instances/${instanceId}/auth/disconnect`,
      });
    }

    case 'status': {
      const instanceId = this.getNodeParameter('instanceId', itemIndex) as string;
      return relayStackApiRequest.call(this, {
        method: 'GET',
        endpoint: `/instances/${instanceId}/status`,
      });
    }

    case 'sendLoginCode': {
      const instanceId = this.getNodeParameter('instanceId', itemIndex) as string;
      const phoneNumber = this.getNodeParameter('phoneNumber', itemIndex) as string;
      return relayStackApiRequest.call(this, {
        method: 'POST',
        endpoint: `/instances/${instanceId}/auth/send-code`,
        body: { phone_number: phoneNumber },
      });
    }

    case 'verifyCode': {
      const instanceId = this.getNodeParameter('instanceId', itemIndex) as string;
      const code = this.getNodeParameter('code', itemIndex) as string;
      return relayStackApiRequest.call(this, {
        method: 'POST',
        endpoint: `/instances/${instanceId}/auth/verify-code`,
        body: { code },
      });
    }

    case 'verifyPassword': {
      const instanceId = this.getNodeParameter('instanceId', itemIndex) as string;
      const password = this.getNodeParameter('password', itemIndex) as string;
      return relayStackApiRequest.call(this, {
        method: 'POST',
        endpoint: `/instances/${instanceId}/auth/2fa`,
        body: { password },
      });
    }

    default:
      throw new Error(`Operation "${operation}" is not supported for Instance resource`);
  }
}

async function executeMessageOperation(
  this: IExecuteFunctions,
  operation: string,
  itemIndex: number,
) {
  switch (operation) {
    case 'sendText': {
      const instanceId = this.getNodeParameter('instanceId', itemIndex) as string;
      const rawChatId = this.getNodeParameter('chatId', itemIndex) as string;
      const text = this.getNodeParameter('text', itemIndex) as string;
      const chatId = parseChatId(rawChatId);
      return relayStackApiRequest.call(this, {
        method: 'POST',
        endpoint: `/instances/${instanceId}/send-message`,
        body: { chat_id: chatId, text },
      });
    }

    default:
      throw new Error(`Operation "${operation}" is not supported for Message resource`);
  }
}

async function executeChatOperation(
  this: IExecuteFunctions,
  operation: string,
  itemIndex: number,
) {
  switch (operation) {
    case 'listChats': {
      const instanceId = this.getNodeParameter('instanceId', itemIndex) as string;
      return relayStackApiRequest.call(this, {
        method: 'GET',
        endpoint: `/instances/${instanceId}/chats`,
      });
    }

    case 'getChatMessages': {
      const instanceId = this.getNodeParameter('instanceId', itemIndex) as string;
      const chatId = this.getNodeParameter('chatId', itemIndex) as number;
      const limit = this.getNodeParameter('limit', itemIndex) as number;
      const offsetId = this.getNodeParameter('offsetId', itemIndex) as number;
      const query: IDataObject = { limit };
      if (offsetId > 0) {
        query.offset_id = offsetId;
      }
      return relayStackApiRequest.call(this, {
        method: 'GET',
        endpoint: `/instances/${instanceId}/chats/${chatId}/messages`,
        query,
      });
    }

    default:
      throw new Error(`Operation "${operation}" is not supported for Chat resource`);
  }
}

async function executeEventOperation(
  this: IExecuteFunctions,
  operation: string,
  itemIndex: number,
) {
  switch (operation) {
    case 'setWebhook': {
      const instanceId = this.getNodeParameter('instanceId', itemIndex) as string;
      const webhookUrl = this.getNodeParameter('webhookUrl', itemIndex) as string;
      return relayStackApiRequest.call(this, {
        method: 'POST',
        endpoint: `/instances/${instanceId}/webhook`,
        body: { url: webhookUrl },
      });
    }

    case 'getWebhook': {
      const instanceId = this.getNodeParameter('instanceId', itemIndex) as string;
      return relayStackApiRequest.call(this, {
        method: 'GET',
        endpoint: `/instances/${instanceId}/webhook`,
      });
    }

    case 'deleteWebhook': {
      const instanceId = this.getNodeParameter('instanceId', itemIndex) as string;
      return relayStackApiRequest.call(this, {
        method: 'DELETE',
        endpoint: `/instances/${instanceId}/webhook`,
      });
    }

    case 'testWebhook': {
      const instanceId = this.getNodeParameter('instanceId', itemIndex) as string;
      return relayStackApiRequest.call(this, {
        method: 'POST',
        endpoint: `/instances/${instanceId}/webhook/test`,
      });
    }

    default:
      throw new Error(`Operation "${operation}" is not supported for Event resource`);
  }
}

function parseChatId(raw: string): number {
  const trimmed = raw.trim();
  const stripped = trimmed.replace(/^[@+ ]+/, '').replace(/[^0-9-]/g, '');
  if (!stripped || stripped === '-') {
    throw new Error(`Invalid Chat ID: "${raw}". Use a numeric ID, @username, or phone number.`);
  }
  return parseInt(stripped, 10);
}
