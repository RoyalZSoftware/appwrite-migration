import * as fs from 'fs';
import * as path from 'path';
import { validatePresence } from './validation.js';

export const credentialsFile = process.env.HOME + "/appwrite-migration-credentials.json"

/**
 * @typedef {Object} Credentials
 */

export function setCredentials(endpoint, key, projectId, databaseId) {
    validatePresence(endpoint, "endpoint");
    validatePresence(key, "key");
    validatePresence(projectId, "projectId");
    validatePresence(databaseId, "databaseId");
    fs.writeFileSync(path.resolve(credentialsFile), JSON.stringify({
        endpoint,
        key,
        projectId,
        databaseId,
    }));
}

/**
 * @return {Object}
 */
export function getCredentials() {
    if (!fs.existsSync(credentialsFile)) {
        throw new Error("Credentials file not found.");
    }

    const content = fs.readFileSync(credentialsFile);

    return JSON.parse(content);
}

export function clearCredentials() {
    if (!fs.existsSync(credentialsFile)) return;

    fs.unlinkSync(credentialsFile);
}