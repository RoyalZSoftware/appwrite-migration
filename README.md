# Appwrite Migration

CLI tool to migrate collection schemas on appwrite.

## Demo

[![Youtube Thumbnail](https://img.youtube.com/vi/d1UhZmYRSHM/0.jpg)](https://www.youtube.com/watch?v=d1UhZmYRSHM)

## Usage

```
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
```