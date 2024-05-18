/**
 * @typedef {Object} Collection
 * 
 * @typedef {Object} Database
 * 
 * @typedef {Object} Bucket
 * 
 * @typedef {Object} MigrationSchema
 * @property {Collection[]} collections
 * @property {Database[]} databases
 * @property {Bucket} buckets
 * @property {number} version
 */

import { getMetadata } from "./metadata.js";

/**
 * @param {import("./client").AppwriteMigrationClient} migrationClient
 */
export async function generateSchema(migrationClient) {
    const schema = {
        databases: [],
        collections: [],
        version: undefined,
    };

    schema.databases = (await migrationClient.databases.list()).databases;

    for (const database of schema.databases) {
        const collections = (await migrationClient.databases.listCollections(database.$id)).collections;
        schema.collections.push(...collections);
    }

    const hasDatabase = schema.databases.length > 0;

    if (hasDatabase) {
        try {
            schema.version = (await getMetadata(migrationClient, schema.databases[0].$id)).schemaVersion;
        } catch {
            schema.version = new Date();
        }
    } else {
        schema.version = new Date();
    }


    return schema;
}

export function generateSchemaLock(schema) {
    return JSON.stringify(schema);
}

export function hasSchemaChanged(oldSchema, newSchema) {
    return generateSchemaLock(oldSchema) == generateSchemaLock(newSchema);
}