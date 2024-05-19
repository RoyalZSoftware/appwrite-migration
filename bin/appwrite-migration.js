#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import{ Client } from 'node-appwrite';
import meow from 'meow';
import {clearCredentials, createMigrationClient, credentialsFile, generateSchema, getCredentials, setCredentials, newMigration, changeMetadata, getMetadata} from '../src/index.js';
import { ID } from 'node-appwrite';

function uiError(error) {
    console.error("[!]", error);
}

function uiLog(message) {
    console.log("[*]", message)
}

function isLoginCommand(_, input) {
    return input.at(0) == "login";
}

async function runApp() {
    const cli = meow(`
        Usage
            $ appwrite-migration [-v | --version] <command> [<args>]
        
        Options
            --version, -v Show the CLI version
            --databaseId, -d The database id of your project. Currently not supported.
            --projectId, -p The id of your appwrite project
            --collection, -c The id of the collection that you want to operate on
            --endpoint The appwrite instance endpoint url. Defaults to "https://cloud.appwrite.com/v1"
            --file The file path for the operation
            --key The api key for your appwrite account

        Commands
            login [-p | --projectId <projectId>] [--endpoint <AppwriteApiUrl>] [--key <apikey>] [--databaseId | -d <id>]
                Use this to enter your credentials. They will be stored in ${credentialsFile}

            new-migration [<migrationName>] [-d | --directory=./migrations]
                Create a new migration inside the directory.
            
            logout
                Clear the credentials file: ${credentialsFile}

            run [-d | --databaseId] [<migrationPath>]
                Runs the path that lies under this <migrationPath>. If the version specified in the migration is
                older than the metadata of the database. It won't be run.
            
            backup [-d | --databaseId] [-c | --collection <id>] [<downloadFolder>]
                Downloads all the data from all the collections (or specified within the -c flag)
            
            restore [-d | --databaseId][<collection> <file>]
                Restore the <collection> with the data from the provided <file>
            
            import [<schemaPath>]
                Creates the databases and collections from the generated schema.
            
            generate-schema [-d | --databaseId] [-f | --file <filepath>]
                Generates the schema and prints it out.
                If [--file] is provided stores the schema in the path.

        Examples
            $ appwrite-migration --version
            $ appwrite-migration login --projectId 123893
            $ appwrite-migration run migrations/add_lastname_to_users.js -d primary
            $ appwrite-migration backup -c users -c countries ./download/ -d primary
            $ appwrite-migration restore -c users ./download/users.json -d primary
    `,{
        importMeta: import.meta,
        flags: {
            version: {
                type: 'boolean',
                shortFlag: 'v'
            },
            file: {
                type: 'string',
                shortFlag: 'f',
            },
            key: {
                type: 'string',
                isRequired: isLoginCommand,
            },
            projectId: {
                type: 'string',
                shortFlag: 'p',
                isRequired: isLoginCommand,
            },
            databaseId: {
                type: 'string',
                shortFlag: 'd'
            },
            endpoint: {
                type: 'string',
                default: 'https://cloud.appwrite.io/v1'
            }
        }
    })

    const buildMigrationClient = () => {
        try {
            const credentials = getCredentials();
            return createMigrationClient(
                new Client()
                    .setEndpoint(credentials.endpoint)
                    .setKey(credentials.key)
                    .setProject(credentials.projectId)
            );
        } catch {
            uiError("Please login.")
        }
    }

    const commands = {
        login: async (flags) => {
            try {
                setCredentials(flags.endpoint, flags.key, flags.projectId, flags.databaseId);
                uiLog("Stored credentials!");
            } catch(e) {
                if (e.key) {
                    return uiError("Please provide --" + e.key);
                }
                throw e;
            }
        },
        logout: () => {
            clearCredentials();
            uiLog("Successfully cleared credentials.");
        },
        "run-all": async (flags, args) => {
            const migrationsDirectory = args[0];

            if (migrationsDirectory == undefined) {
                uiError("Please provide a migrations directory.");
                return;
            }

            const migrations = fs.readdirSync(migrationsDirectory);

            /**
             * Execute the `run` command for every file in the migrations directory
             */
            for (const migration of migrations) {
                await commands['run'](flags, [path.join(migrationsDirectory, migration)], true);
            }
        },
        import: async (flags, args) => {
        },
        run: async (flags, args, sequence = false) => {
            const migrationClient = buildMigrationClient();
            const migrationPath = args[0];

            if (migrationPath == undefined) {
                uiError("No <migrationPath> provided.");
                cli.showHelp();
                return;
            }

            let migration = undefined;

            function defineMigration(date, cb) {
                migration = {date, cb}
                uiLog("Found migration: " + date.toISOString());
            }

            function evalInContext() {
                const migrationContent = fs.readFileSync(migrationPath, {encoding: 'utf8'});
                eval(migrationContent)
            }

            evalInContext.call({
                ...this,
                defineMigration,
                databaseId: flags.databaseId,
            });
            if (!migration?.date)
                return;

            const schemaVersion = (await getMetadata(migrationClient, flags.databaseId))?.schemaVersion;

            const hasAlreadyBeenApplied = migration.date.getTime() <= new Date(schemaVersion).getTime();
            if (hasAlreadyBeenApplied) {
                if (sequence == false)
                    uiError("This migration is older than the database version.");
                else
                    uiLog("Skipped because it already has been applied");
                return;
            }
            uiLog("Running migration: " + migrationPath +". Found version: " + migration?.date);
            
            await migration.cb(migrationClient);

            await changeMetadata(migrationClient, flags.databaseId, {
                schemaVersion: migration.date,
            })
        },
        backup: (flags, args) => {

        },
        restore: (flags, args) => {
        },
        "new-migration": (flags, args) => {
            if (args.length !== 1) {
                cli.showHelp();
            }
            const migrationTimeStamp = new Date();
            const destinationPath = path.join(flags.directory ?? "./migrations", Math.round(migrationTimeStamp.getTime() / 1000).toString() + "_" + args[0] + ".js");
            newMigration(destinationPath, migrationTimeStamp);
            uiLog("Successfully created new migration. Open: " + destinationPath)
        },
        "generate-schema": async (flags) => {
            const migrationClient = buildMigrationClient();
            uiLog("Generating schema.");
            const schema = await generateSchema(migrationClient, flags.databaseId);
            
            if (flags.file) {
                fs.writeFileSync(flags.file, JSON.stringify(schema));
            } else {
                console.log(schema);
            }
        }
    };

    const command = cli.input.at(0);

    if (command == undefined || commands[command] == null) {
        cli.showHelp();
    }

    const args = cli.input.slice(1);
    await commands[command](cli.flags, args);
}

runApp();