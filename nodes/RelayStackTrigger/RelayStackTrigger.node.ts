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
    description: 'Receive RelayStack events via webhook',
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
        displayName: 'Instance Name',
        name: 'instanceName',
        type: 'string',
        default: '',
        required: true,
        description: 'Name of the RelayStack instance to receive events from',
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
        const instanceName = this.getNodeParameter('instanceName') as string;
        try {
          await relayStackTriggerApiRequest.call(this, 'GET', `/webhook/find/${instanceName}`);
          return true;
        } catch {
          return false;
        }
      },

      async create(this: IHookFunctions): Promise<boolean> {
        const instanceName = this.getNodeParameter('instanceName') as string;
        const webhookUrl = this.getNodeWebhookUrl('default');
        if (!webhookUrl) {
          throw new NodeOperationError(this.getNode(), 'Could not get webhook URL');
        }
        const events = ['message_received', 'message_sent', 'connection_state', 'auth_request'];
        await relayStackTriggerApiRequest.call(this, 'POST', `/webhook/set/${instanceName}`, {
          webhookUrl,
          events,
          enable: true,
        });
        return true;
      },

      async delete(this: IHookFunctions): Promise<boolean> {
        const instanceName = this.getNodeParameter('instanceName') as string;
        try {
          await relayStackTriggerApiRequest.call(this, 'DELETE', `/webhook/delete/${instanceName}`);
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
    throw new NodeOperationError(this.getNode(), `RelayStack API error: ${(error as Error).message}`);
  }
}
