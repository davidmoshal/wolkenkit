import { Application } from 'express';
import { ApplicationDefinition } from '../../../../common/application/ApplicationDefinition';
import { CorsOrigin } from 'get-cors-origin';
import { getApiBase } from '../../../base/getApiBase';
import { getAuthenticationMiddleware } from '../../../base/getAuthenticationMiddleware';
import { getDescription } from './getDescription';
import { IdentityProvider } from 'limes';
import { OnReceiveCommand } from '../../OnReceiveCommand';
import { postCommand } from './postCommand';

const getV2 = async function ({
  corsOrigin,
  onReceiveCommand,
  applicationDefinition,
  identityProviders
}: {
  corsOrigin: CorsOrigin;
  onReceiveCommand: OnReceiveCommand;
  applicationDefinition: ApplicationDefinition;
  identityProviders: IdentityProvider[];
}): Promise<{ api: Application }> {
  const api = await getApiBase({
    request: {
      headers: { cors: { origin: corsOrigin }},
      body: { parser: { sizeLimit: 100_000 }},
      query: { parser: { useJson: true }}
    },
    response: {
      headers: { cache: false }
    }
  });

  const authenticationMiddleware = await getAuthenticationMiddleware({
    identityProviders
  });

  api.get(`/${getDescription.path}`, getDescription.getHandler({
    applicationDefinition
  }));

  api.post(`/${postCommand.path}`, authenticationMiddleware, postCommand.getHandler({
    onReceiveCommand,
    applicationDefinition
  }));

  return { api };
};

export { getV2 };
