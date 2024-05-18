const metadataCollectionId = "appwrite-migrations";
const metadataDocumentId = "metadata";

/**
 * 
 * @param {import("./client").AppwriteMigrationClient} migrationClient 
 * @param {string} databaseId 
 * @returns 
 */
export const getMetadata = async (migrationClient, databaseId) => {
    return migrationClient.databases.getDocument(databaseId, metadataCollectionId, metadataDocumentId).catch(() => {
        return setupMetadataCollection(migrationClient, databaseId).then(() => {
            return getMetadata(migrationClient, databaseId);
        });
    }).then((result) => {
        return result;
    });
}

/**
 * 
 * @param {import("./client").AppwriteMigrationClient} migrationClient 
 * @param {string} databaseId 
 */
export async function changeMetadata(migrationClient, databaseId, config) {
    try {
        await getMetadata(migrationClient, databaseId);
        await migrationClient.databases.updateDocument(databaseId, metadataCollectionId, metadataDocumentId, config)
    } catch {
        await createMetadata(migrationClient, databaseId, config);
    }
}

async function createMetadata(migrationClient, databaseId, config) {
    return migrationClient.databases.createDocument(databaseId, metadataCollectionId, metadataDocumentId, config);
}

/**
 * @param {import("./client").AppwriteMigrationClient} migrationClient
 */
export async function setupMetadataCollection(migrationClient, databaseId) {
    await migrationClient.databases.createCollection(databaseId, metadataCollectionId, metadataCollectionId);
    await migrationClient.databases.createDatetimeAttribute(databaseId, metadataCollectionId, "schemaVersion", true);
    await createMetadata(migrationClient, databaseId, {schemaVersion: new Date().toISOString()});
}