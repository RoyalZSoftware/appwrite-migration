import {Databases, Client} from 'node-appwrite';

/**
 * @typedef {Object} AppwriteMigrationClient
 * @property {Client} client
 * @property {Databases} databases
 */

/**
 * @param {Client} client
 * 
 * @return {AppwriteMigrationClient}
 */
export function createMigrationClient(client) {
    return {
        client,
        databases: new Databases(client)
    };
}