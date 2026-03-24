import mysql from "mysql2/promise";

/**
 *
 */
export default class DatabaseConnection {

    #uri;
    #connected = false;

    constructor(connectionURI) {
        this.#uri = connectionURI;

        this.logging = this.logging.bind(this);

        this.connection = (async () => await mysql.createConnection(connectionURI).catch((error) => this.logging('constructor', error)))();
    }

    logging(errorSource, error) {
        let message = `[MySQL${errorSource ? `::${errorSource}` : ''}] ${error.sqlMessage} (${error.code})`;
        // console.log(error);
        // console.error(message);

        return Promise.reject(message);
    }

    async query(string) {
        if (!string) {
            return this.logging('query', 'A valid query string must be provided.');
        }

        return this.connection.then(connection => connection.query(string).catch((error) => this.logging('query', error)));
    }

    async close() {
        return this.connection.then(connection => connection.end().catch((error) => this.logging('close', error)));
    }
};
