import { RelayStackApi } from './credentials/RelayStackApi.credentials';
import { RelayStack } from './nodes/RelayStack/RelayStack.node';
import { RelayStackTrigger } from './nodes/RelayStackTrigger/RelayStackTrigger.node';

export const nodeTypes = [RelayStack, RelayStackTrigger];
export const credentialTypes = [RelayStackApi];
