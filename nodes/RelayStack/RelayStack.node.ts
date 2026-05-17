import type { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';
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
    description: 'Interact with RelayStack API',
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
  const instanceName = this.getNodeParameter('instanceName', itemIndex, '') as string;

  switch (operation) {
    case 'create':
      return relayStackApiRequest.call(this, {
        method: 'POST',
        endpoint: '/instance/create',
        body: { instanceName, integration: 'telegram' },
      });

    case 'list':
      return relayStackApiRequest.call(this, {
        method: 'GET',
        endpoint: '/instance/list',
      });

    case 'get':
      return relayStackApiRequest.call(this, {
        method: 'GET',
        endpoint: `/instance/${instanceName}`,
      });

    case 'delete':
      return relayStackApiRequest.call(this, {
        method: 'DELETE',
        endpoint: `/instance/${instanceName}`,
      });

    case 'connect':
      return relayStackApiRequest.call(this, {
        method: 'POST',
        endpoint: `/instance/connect/${instanceName}`,
      });

    case 'disconnect':
      return relayStackApiRequest.call(this, {
        method: 'POST',
        endpoint: `/instance/disconnect/${instanceName}`,
      });

    case 'status':
      return relayStackApiRequest.call(this, {
        method: 'GET',
        endpoint: `/instance/connectionState/${instanceName}`,
      });

    case 'sendLoginCode': {
      const phoneNumber = this.getNodeParameter('phoneNumber', itemIndex) as string;
      return relayStackApiRequest.call(this, {
        method: 'POST',
        endpoint: `/instance/sendCode/${instanceName}`,
        body: { phoneNumber },
      });
    }

    case 'verifyCode': {
      const code = this.getNodeParameter('code', itemIndex) as string;
      return relayStackApiRequest.call(this, {
        method: 'POST',
        endpoint: `/instance/verifyCode/${instanceName}`,
        body: { code },
      });
    }

    case 'verifyPassword': {
      const password = this.getNodeParameter('password', itemIndex) as string;
      return relayStackApiRequest.call(this, {
        method: 'POST',
        endpoint: `/instance/verifyPassword/${instanceName}`,
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
  const instanceName = this.getNodeParameter('instanceName', itemIndex, '') as string;

  switch (operation) {
    case 'sendText': {
      const chatId = this.getNodeParameter('chatId', itemIndex) as string;
      const text = this.getNodeParameter('text', itemIndex) as string;
      return relayStackApiRequest.call(this, {
        method: 'POST',
        endpoint: `/message/sendText/${instanceName}`,
        body: { number: chatId, text, options: { delay: 0 } },
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
  const instanceName = this.getNodeParameter('instanceName', itemIndex, '') as string;

  switch (operation) {
    case 'listChats':
      return relayStackApiRequest.call(this, {
        method: 'GET',
        endpoint: `/chat/find/${instanceName}`,
      });

    case 'getChatMessages': {
      const chatId = this.getNodeParameter('chatId', itemIndex) as string;
      const limit = this.getNodeParameter('limit', itemIndex) as number;
      const offset = this.getNodeParameter('offset', itemIndex) as number;
      return relayStackApiRequest.call(this, {
        method: 'GET',
        endpoint: `/chat/messages/${instanceName}`,
        query: { chatId, limit, offset },
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
  const instanceName = this.getNodeParameter('instanceName', itemIndex, '') as string;

  switch (operation) {
    case 'setWebhook': {
      const webhookUrl = this.getNodeParameter('webhookUrl', itemIndex) as string;
      const events = this.getNodeParameter('events', itemIndex) as string[];
      return relayStackApiRequest.call(this, {
        method: 'POST',
        endpoint: `/webhook/set/${instanceName}`,
        body: { webhookUrl, events, enable: true },
      });
    }

    case 'getWebhook':
      return relayStackApiRequest.call(this, {
        method: 'GET',
        endpoint: `/webhook/find/${instanceName}`,
      });

    case 'deleteWebhook':
      return relayStackApiRequest.call(this, {
        method: 'DELETE',
        endpoint: `/webhook/delete/${instanceName}`,
      });

    case 'testWebhook':
      return relayStackApiRequest.call(this, {
        method: 'POST',
        endpoint: `/webhook/test/${instanceName}`,
      });

    default:
      throw new Error(`Operation "${operation}" is not supported for Event resource`);
  }
}
