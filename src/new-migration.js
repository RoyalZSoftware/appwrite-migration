import * as fs from 'fs';

export function newMigration(filepath, date) {
    const content = `/**
* @param {import("appwrite-migration").AppwriteMigrationClient} migrationClient
*/
const doMigrate = async (migrationClient) => {

    /**
     * TODO: Write your migration here.
     * 
     * You have following properties in this scope:
     *   - this.databaseId
     *   - this.defineMigration
     * 
     * @example
     * const reportTableId = "reports";
     * await migrationClient.databases.createCollection(this.databaseId, reportTableId, reportTableId);
     * await migrationClient.databases.createStringAttribute(this.databaseId, reportTableId, "organizationId", 3000, true);
     */
}

this.defineMigration(new Date("${date.toISOString()}"), async (migrationClient) => {
    await doMigrate(migrationClient);
});`

    fs.writeFileSync(filepath, content);
}
