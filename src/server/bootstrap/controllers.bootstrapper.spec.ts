import { TestBed } from '@angular/core/testing';
import { Injectable } from '@angular/core';
import { RemoteCliMock } from '../services/remoteCli.service.mock';
import { RemoteCli } from '../services/remoteCli.service';
import { ServerMock } from '../servers/abstract.server.mock';
import { Logger } from '../../common/services/logger.service';
import { LoggerMock } from '../../common/services/logger.service.mock';
import { Server } from '../servers/abstract.server';
import { bootstrap, BootstrapResponse } from './bootstrap';
import { EntityRegistry } from '../../common/registry/entityRegistry';
import { AbstractController } from '../controllers/abstract.controller';
import { Route } from '../controllers/route.decorator';
import { Request } from '../controllers/request';
import { Response } from '../controllers/response';
import { AuthServiceMock } from '../services/auth.service.mock';
import { AuthService } from '../services/auth.service';

const providers: any[] = [
  {provide: Logger, useClass: LoggerMock},
  {provide: Server, useClass: ServerMock},
  {provide: RemoteCli, useClass: RemoteCliMock},
  {provide: AuthService, useClass: AuthServiceMock},
];

@Injectable()
class TestController extends AbstractController {

  constructor(logger: Logger) {
    super(logger);
  }

  @Route('GET', '/test')
  public test(request: Request, response: Response): any {
  }

}

describe('Controller Bootstrapper', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({ providers });
    EntityRegistry.clearAll();

    EntityRegistry.register('controller', TestController);

  });

  it('resolves and initializes controller with injector and registers routes with server', (done: Function) => {

    const result = bootstrap(undefined, providers)();

    return result.then((res: BootstrapResponse) => {

      const routes = res.server.configuredRoutes;

      const controller = res.injector.get(TestController);

      expect(controller)
        .toBeDefined();
      expect(controller instanceof TestController)
        .toBe(true, 'Instance is not a TestController');
      expect(routes[0].methodName)
        .toEqual('test');

      done();

    });

  });

});
