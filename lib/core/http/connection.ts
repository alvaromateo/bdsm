import { InvalidJSON, RequestNotSent, RequestFailure, ResponseNotOk } from './connectionError';
import ResponseParser from './responseParser';

/**
 * This class represents a connection between 2 computers.
 * The messages are send always in the direction of the computer that is running this code
 * towards the target computer set when the Connection is created.
 * The messages are HTTP requests (get, post).
 */
class Connection {
  target: URL;
  timeout: number; // ms

  /**
   * Creates a new connection instance.
   *
   * @param url the host url with whom the connection will be established.
   * @param timeout max time in ms to wait for a reply from the target.
   */
  constructor(url: string, timeout = 1000) {
    url = url.trim();
    // remove last '/' from the serverURL
    if (url.lastIndexOf('/') === url.length - 1) {
      url = url.slice(0, -1);
    }
    // if it's not a valid URL, throw error
    this.target = new URL('/', url);
    this.timeout = timeout;
  }

  /**
   * Sends a GET request to the target to obtain a response that is then parsed into an
   * object ParsedResponse.
   *
   * @param path the path/endpoint to which the request will be sent.
   * @param responseParser the method that is used to parse the response from the target.
   * @param params any search parameters to append to the url.
   * @returns a ParsedResponse instance.
   */
  async get<ParsedResponse>(
    path: string,
    responseParser: ResponseParser<ParsedResponse>,
    params?: URLSearchParams,
  ): Promise<ParsedResponse> {
    if (params) {
      path = `${path}?${params.toString()}`;
    }
    const url = new URL(path, this.target);
    return this.#fetchAndParseResponse(url, {}, responseParser);
  }

  /**
   * Sends a POST request to the target to obtain a response that is then parsed into an
   * object ParsedResponse. This method accepts a body with a payload to be sent.
   *
   * @param path the path/endpoint to which the request will be sent.
   * @param body the payload to be sent in the POST request.
   * @param responseParser the method that is used to parse the response from the target.
   * @param params any search parameters to append to the url.
   * @returns a ParsedResponse instance.
   */
  async post<ParsedResponse>(
    path: string,
    body: string,
    responseParser: ResponseParser<ParsedResponse>,
    params?: URLSearchParams,
  ): Promise<ParsedResponse> {
    if (params) {
      path = `${path}?${params.toString()}`;
    }
    const url = new URL(path, this.target);
    return this.#fetchAndParseResponse(url, { body: body, method: 'POST' }, responseParser);
  }

  async #fetchAndParseResponse<ParsedResponse>(
    url: URL,
    requestOptions: RequestInit,
    responseParser: ResponseParser<ParsedResponse>,
  ): Promise<ParsedResponse> {
    let response: Response | null = null;
    try {
      response = await this.#fetchWithTimeout(url, requestOptions);
    } catch (error) {
      if (error instanceof DOMException || error instanceof TypeError) {
        console.error(error.message);
        throw new RequestNotSent('Request could not be sent');
      }
      if (response) {
        console.error(`Request failed. Status: ${response.status}`);
        throw new ResponseNotOk(`Response status: ${response.status}`);
      }
      // re-throw the error
      throw error;
    }

    if (!response.ok) {
      throw new ResponseNotOk(`Response status: ${response.status}`);
    }

    let json: unknown = null;
    try {
      json = await response.json();
    } catch (error) {
      if (error instanceof DOMException || error instanceof Error) {
        console.error(error.message);
        throw new InvalidJSON('Could not parse JSON');
      }
      // re-throw the error
      throw error;
    }

    if (!json) {
      throw new InvalidJSON('The JSON object is null');
    }
    return responseParser(json);
  }

  #fetchWithTimeout(url: URL, requestOptions: RequestInit): Promise<Response> {
    return new Promise((resolve, reject) => {
      const fetchPromise = fetch(url, requestOptions);
      let timeoutId: ReturnType<typeof setTimeout>;
      const timeoutPromise = new Promise<Response>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new RequestFailure('Request Timed Out'));
        }, this.timeout);
      });

      const promises: Array<Promise<Response>> = [fetchPromise, timeoutPromise];

      Promise.race(promises)
        .then(resolve)
        .catch(reject)
        .finally(() => {
          clearTimeout(timeoutId);
        });
    });
  }
}

export default Connection;
