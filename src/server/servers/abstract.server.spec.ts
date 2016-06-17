import { Server, RouteConfig } from './abstract.server';
import { RemoteCli } from '../services/remoteCli.service';
import { Logger } from '../../common/services/logger.service';
import { Injectable, provide } from '@angular/core';
import { it, inject, beforeEachProviders, expect, describe } from '@angular/core/testing';
import { LoggerMock } from '../../common/services/logger.service.spec';
import { RemoteCliMock } from '../services/remoteCli.service.spec';
import { Request } from '../controllers/request';
import { Response } from '../controllers/response';
import Spy = jasmine.Spy;

@Injectable()
export class ServerMock extends Server {

  public getEngine(): any {
    return undefined;
  }

  constructor(logger: Logger, remoteCli: RemoteCli) {
    super(logger, remoteCli);
  }

  protected registerRouteWithEngine(config: RouteConfig): this {
    return this;
  }

  protected initialize(): this {
    return this;
  }

  public start(): Promise<this> {
    return Promise.resolve(this);
  }

}

describe('Server', () => {

  const providers = [
    provide(Server, {useClass: ServerMock}),
    provide(Logger, {useClass: LoggerMock}),
    provide(RemoteCli, {useClass: RemoteCliMock}),
  ];

  beforeEachProviders(() => providers);

  let cliSpy: Spy;

  beforeEach(() => {
    spyOn(ServerMock.prototype, 'initialize')
      .and
      .callThrough();
    cliSpy = spyOn(RemoteCliMock.prototype, 'start');
  });

  it('initializes the server with port and host', inject([Server], (server: Server) => {

    console.log((<any>server).initialize.calls.count());

    expect((<any>server).initialize)
      .toHaveBeenCalled();

    expect(cliSpy)
      .toHaveBeenCalledWith(3001);

    expect(server.getHost())
      .toEqual('http://localhost:3000');

  }));

  it('returns the engine', inject([Server], (server: Server) => {

    expect(server.getEngine())
      .toBe(undefined);

  }));

  it('returns the inner http server instance', inject([Server], (server: Server) => {

    expect(server.getHttpServer())
      .toBe(undefined);

  }));

  it('registers routes', inject([Server], (server: Server) => {

    const routeConfig: RouteConfig = {
      path: '/test',
      methodName: 'test',
      method: 'GET',
      callStack: [],
      callStackHandler: null
    };

    let spy = spyOn(server, 'registerRouteWithEngine');

    server.register(routeConfig);

    expect(spy)
      .toHaveBeenCalledWith(routeConfig);
    expect(server.getRoutes())
      .toEqual([routeConfig]);
  }));

  it('starts the server running and returns promise', inject([Server], (server: Server) => {

    let spy = spyOn(server, 'start').and.callThrough();

    let response = server.start();

    expect(spy)
      .toHaveBeenCalled();

    return response.then((onStart:Server) => {
      expect(onStart).toEqual(server);
    });

  }));

  it('starts the server running and returns promise', inject([Server], (server: Server) => {
    const response: Response = (<any>server).getDefaultResponse();

    expect(response instanceof Response).toBe(true);

  }));

});

