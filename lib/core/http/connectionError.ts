export class ConnectionError implements Error {
  name = 'CommunicationError';
  message: string;

  constructor(message: string) {
    this.message = message;
  }
}

export class RequestNotSent extends ConnectionError {
  constructor(message: string) {
    super(message);
  }
}

export class RequestFailure extends ConnectionError {
  constructor(message: string) {
    super(message);
  }
}

export class ResponseNotOk extends ConnectionError {
  constructor(message: string) {
    super(message);
  }
}

export class InvalidJSON extends ConnectionError {
  constructor(message: string) {
    super(message);
  }
}
