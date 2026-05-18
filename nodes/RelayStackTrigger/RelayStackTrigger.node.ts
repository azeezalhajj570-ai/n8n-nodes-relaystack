import type {
  IHookFunctions,
  IWebhookFunctions,
  INodeType,
  INodeTypeDescription,
  IWebhookResponseData,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import axios, { type AxiosRequestConfig } from 'axios';

export class RelayStackTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'RelayStack Trigger',
    name: 'relayStackTrigger',
    icon: 'file:relaystack.svg',
    group: ['trigger'],
    version: 1,
    subtitle: '={{$parameter["event"]}}',
    description: 'Receive Telegram API Gateway events via webhook',
    defaults: {
      name: 'RelayStack Trigger',
    },
    inputs: [],
    outputs: ['main'],
    credentials: [
      {
        name: 'relayStackApi',
        required: true,
      },
    ],
    webhooks: [
      {
        name: 'default',
        httpMethod: 'POST',
        responseMode: 'onReceived',
        path: 'relaystack',
      },
    ],
    properties: [
      {
        displayName: 'Instance ID',
        name: 'instanceId',
        type: 'string',
        default: '',
        required: true,
        description: 'UUID of the instance to receive events from',
      },
      {
        displayName: 'Event',
        name: 'event',
        type: 'options',
        options: [
          {
            name: 'All Events',
            value: 'all',
            description: 'Receive all event types',
          },
          {
            name: 'Message Received',
            value: 'message_received',
            description: 'Trigger when a new message is received',
          },
          {
            name: 'Message Sent',
            value: 'message_sent',
            description: 'Trigger when a message is sent',
          },
          {
            name: 'Connection Status Changed',
            value: 'connection_state',
            description: 'Trigger when connection status changes',
          },
          {
            name: 'Authentication Required',
            value: 'auth_request',
            description: 'Trigger when authentication is needed',
          },
        ],
        default: 'all',
        description: 'Event type to trigger on',
      },
    ],
  };

  webhookMethods = {
    default: {
      async checkExists(this: IHookFunctions): Promise<boolean> {
        const instanceId = this.getNodeParameter('instanceId') as string;
        try {
          await relayStackTriggerApiRequest.call(this, 'GET', `/instances/${instanceId}/webhook`);
          return true;
        } catch {
          return false;
        }
      },

      async create(this: IHookFunctions): Promise<boolean> {
        const instanceId = this.getNodeParameter('instanceId') as string;
        const webhookUrl = this.getNodeWebhookUrl('default');
        if (!webhookUrl) {
          throw new NodeOperationError(this.getNode(), 'Could not get webhook URL');
        }
        await relayStackTriggerApiRequest.call(this, 'POST', `/instances/${instanceId}/webhook`, {
          url: webhookUrl,
        });
        return true;
      },

      async delete(this: IHookFunctions): Promise<boolean> {
        const instanceId = this.getNodeParameter('instanceId') as string;
        try {
          await relayStackTriggerApiRequest.call(this, 'DELETE', `/instances/${instanceId}/webhook`);
        } catch (_error) {
          // Webhook may have already been deleted — ignore silently
        }
        return true;
      },
    },
  };

  async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
    const body = this.getBodyData();
    const selectedEvent = this.getNodeParameter('event') as string;
    const bodyData = body as { eventType?: string; data?: object };

    if (selectedEvent !== 'all' && bodyData.eventType && bodyData.eventType !== selectedEvent) {
      return { noWebhookResponse: true };
    }

    return {
      workflowData: [[{ json: bodyData }]],
      webhookResponse: { status: 'received' },
    };
  }
}

async function relayStackTriggerApiRequest(
  this: IHookFunctions | IWebhookFunctions,
  method: string,
  endpoint: string,
  body?: object,
) {
  const credentials = await this.getCredentials('relayStackApi') as {
    baseUrl: string;
    apiKey: string;
  };

  const baseUrl = credentials.baseUrl.replace(/\/$/, '');
  const url = `${baseUrl}${endpoint}`;

  const config: AxiosRequestConfig = {
    method: method as AxiosRequestConfig['method'],
    url,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${credentials.apiKey}`,
    },
    data: body,
  };

  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    throw new NodeOperationError(this.getNode(), `Telegram API Gateway error: ${(error as Error).message}`);
  }
}
