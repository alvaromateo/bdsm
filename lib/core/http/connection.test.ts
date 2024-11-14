import { jest } from '@jest/globals';
import Connection from './connection';
import { InvalidJSON, RequestFailure, RequestNotSent, ResponseNotOk } from './connectionError';

const TEST_URL = 'http://localhost:3000/';
const TEST_TIMEOUT = 150;

describe('http > connection', () => {
  let fetchMock: jest.Spied<typeof fetch> | undefined;

  const parseResponseMock = jest.fn(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_: unknown): DummyParsedResponse => ({ responseParsed: true }),
  );
  const dummyFetchResponse = () => new Response('{}', { status: 200 });

  beforeEach(() => {
    jest.useFakeTimers();
    fetchMock = jest.spyOn(global, 'fetch');
    jest.spyOn(global, 'setTimeout');
  });

  afterEach(() => {
    jest.runAllTimers();
    jest.restoreAllMocks();
  });

  it('should set up its properties', () => {
    const connection = new Connection(TEST_URL, TEST_TIMEOUT);
    expect(connection.target).toHaveProperty('hostname', 'localhost');
    expect(connection.target).toHaveProperty('port', '3000');
    expect(connection.target).toHaveProperty('protocol', 'http:');
    expect(connection.timeout).toBe(TEST_TIMEOUT);
  });

  it('should throw if an invalid URL is passed', () => {
    expect(() => new Connection('not-a-url', TEST_TIMEOUT)).toThrow();
  });

  it('should send a get request', async () => {
    fetchMock!.mockResolvedValue(dummyFetchResponse());
    const connection = new Connection(TEST_URL, TEST_TIMEOUT);
    const searchParams = new URLSearchParams('q=random&topic=api');

    const response = await connection.get<DummyParsedResponse>(
      'random',
      parseResponseMock,
      searchParams,
    );

    expectResponse(fetchMock!, response);
  });

  it('should send a post request', async () => {
    fetchMock!.mockResolvedValue(dummyFetchResponse());
    const connection = new Connection(TEST_URL, TEST_TIMEOUT);
    const searchParams = new URLSearchParams('q=random&topic=api');

    const response = await connection.post<DummyParsedResponse>(
      'random',
      '{}',
      parseResponseMock,
      searchParams,
    );

    expectResponse(fetchMock!, response);
    // lastCall is expected to have length 2 in the above call
    const requestOptions = fetchMock!.mock.lastCall![1] as RequestInit;
    expect(requestOptions).toHaveProperty('body', '{}');
    expect(requestOptions).toHaveProperty('method', 'POST');
  });

  it('should receive a response in time', async () => {
    // the fetch will take less than the timeout
    fetchMock!.mockImplementation(() => {
      return new Promise((resolve) =>
        setTimeout(() => resolve(new Response('{}', { status: 200 })), TEST_TIMEOUT - 50),
      );
    });

    const connection = new Connection(TEST_URL, TEST_TIMEOUT);
    const res = connection
      .get<DummyParsedResponse>('random', parseResponseMock)
      .then((response) => expect(response).toHaveProperty('responseParsed', true));

    // advance timer
    jest.advanceTimersToNextTimer();
    return res;
  });

  it('should throw RequestFailure on timeout', async () => {
    // the fetch will take longer than the timeout
    fetchMock!.mockImplementation(() => {
      return new Promise((resolve) =>
        setTimeout(() => resolve(new Response('{}', { status: 200 })), TEST_TIMEOUT + 50),
      );
    });
    const connection = new Connection(TEST_URL, TEST_TIMEOUT);
    const res = connection
      .get<DummyParsedResponse>('random', parseResponseMock)
      .catch((error) => expect(error).toBeInstanceOf(RequestFailure));

    // advance timer
    jest.advanceTimersToNextTimer();
    return res;
  });

  it('should throw RequestNotSent when request is aborted', async () => {
    fetchMock!.mockImplementationOnce(() => {
      throw TypeError('Type error');
    });
    const connection = new Connection(TEST_URL, TEST_TIMEOUT);
    const res = connection
      .get<DummyParsedResponse>('random', parseResponseMock)
      .catch((error) => expect(error).toBeInstanceOf(RequestNotSent));

    jest.advanceTimersToNextTimer();
    return res;
  });

  it('should throw RequestNotOk on status > 400', async () => {
    fetchMock!.mockResolvedValue(new Response('{}', { status: 401 }));
    const connection = new Connection(TEST_URL, TEST_TIMEOUT);
    const res = connection
      .get<DummyParsedResponse>('random', parseResponseMock)
      .catch((error) => expect(error).toBeInstanceOf(ResponseNotOk));

    jest.advanceTimersToNextTimer();
    return res;
  });

  it('should throw InvalidJSON for any errors on parsing the response JSON', async () => {
    fetchMock!.mockResolvedValueOnce(new Response('null', { status: 200 }));
    fetchMock!.mockResolvedValueOnce(new Response('{', { status: 200 }));
    const connection = new Connection(TEST_URL, TEST_TIMEOUT);

    await connection
      .get<DummyParsedResponse>('random', parseResponseMock)
      .catch((error) => expect(error).toBeInstanceOf(InvalidJSON));
    jest.advanceTimersToNextTimer();

    await connection
      .get<DummyParsedResponse>('random', parseResponseMock)
      .catch((error) => expect(error).toBeDefined());
    // can't do "expect(error).toBeInstanceOf(InvalidJSON)" because of this bug open to Jest
    // https://github.com/jestjs/jest/issues/2549
    jest.advanceTimersToNextTimer();
  });
});

type DummyParsedResponse = { responseParsed: boolean };

const expectResponse = (fetchMock: jest.Spied<typeof fetch>, response: DummyParsedResponse) => {
  expect(fetchMock).toHaveBeenCalled();
  expect(fetchMock).toHaveBeenCalledTimes(1);
  const lastCall = fetchMock!.mock.lastCall;
  expect(lastCall).toBeDefined();
  expect(lastCall!).toHaveLength(2);
  expect(lastCall![0]).toHaveProperty('hostname', 'localhost');
  expect(lastCall![0]).toHaveProperty('port', '3000');
  expect(lastCall![0]).toHaveProperty('protocol', 'http:');
  expect(lastCall![0]).toHaveProperty('pathname', '/random');
  const actualSearchParams = (lastCall![0] as URL).searchParams;
  expect(actualSearchParams.size).toBe(2);
  expect(Array.from(actualSearchParams.entries())).toEqual([
    ['q', 'random'],
    ['topic', 'api'],
  ]);

  expect(setTimeout).toHaveBeenCalled();
  expect(setTimeout).toHaveBeenCalledTimes(1);

  expect(response).toHaveProperty('responseParsed', true);
};
