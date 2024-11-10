/**
 * Allows to make searches to the server simply by passing a string.
 * There are different type of searches available, depending on the desired results.
 *
 * There should only be one instance of this class to avoid the overhead of creating the object
 * all the time. It doesn't keep any state between searches, so it can be reused.
 *
 * @category Client
 */
class Client {
  connection: string = '';

  constructor(connection: string) {
    this.connection = connection;
  }

  search() {
    // todo
  }

  exactSearch() {
    // todo
  }

  getAllDocuments() {
    // todo
  }

  getByDate() {
    // todo
  }

  getByTag() {
    // todo
  }
}

export default Client;
