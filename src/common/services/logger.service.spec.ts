import { Logger, LogEvent } from './logger.service';
import { Injectable } from '@angular/core';
import { inject, addProviders } from '@angular/core/testing';
import { LoggerMock } from './logger.service.mock';

@Injectable()
class TestClass {

  constructor(public logger: Logger) {

  }

}

const providers = [
  TestClass,
  {provide: Logger, useClass: LoggerMock},
];

describe('Logger mock', () => {

  beforeEach(() => {
    addProviders(providers);
  });

  it('Can be injected with the Logger token', inject([TestClass], (c: TestClass) => {

    let consoleSpy = spyOn(console, 'log');

    expect(c instanceof TestClass)
      .toBe(true);
    expect(c.logger instanceof Logger)
      .toBe(true);
    expect(c.logger instanceof LoggerMock)
      .toBe(true);
    expect(c.logger.debug() instanceof Logger)
      .toBe(true);
    expect(consoleSpy)
      .not
      .toHaveBeenCalled();

  }));

  it('provides observable emitter that broadcasts all logs', inject([Logger], (l: Logger) => {

    const fixture = new Error('something to log');

    let logEvents:LogEvent[] = [];

    const subscription = l.emitter().subscribe((e:LogEvent) => logEvents.push(e));

    l.alert('error: ', fixture.message).debug(fixture);

    expect(logEvents[0].level).toEqual('alert');
    expect(logEvents[0].messages).toEqual(['error: ', fixture.message]);

    expect(logEvents[1].level).toEqual('debug');
    expect(logEvents[1].messages).toEqual([fixture]);

    subscription.unsubscribe();
  }));

});
