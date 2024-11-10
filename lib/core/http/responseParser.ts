interface ResponseParser<T> {
  (response: unknown): T;
}

export default ResponseParser;
