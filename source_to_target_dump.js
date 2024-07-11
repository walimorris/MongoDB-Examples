// This script will copy collections from a source database and copy them to a target database using Atlas.
// You can pass username, password, source, and target arguements (respectively) to the script.
// Note: source and target databases should come from the same deployment and accessible by the user.
// Example Usage: 
// mongosh --nodb sample_restaurants_to_opensquare_dump.js <username> <password> deployment.yxqlxfh.mongodb.net/<sourcedb> deployment.yxqlxfh.mongodb.net/<targetdb>


const args = process.argv.slice(2);

// --nodb, source_to_target_dump.js are counted as args
// --nodb ensures mongosh doesn't try to connect to local instance
if (args.length !== 6) {
    print("Usage: mongosh --nodb source_to_target_dump.js <username> <password> <source> <target>");
    quit(1);
}

// skip first two args (0, 1) because these are --nodb and the script path
const username = args[2];
const password = args[3];
const source = args[4];
const target = args[5];

const sourceUri = `mongodb+srv://${username}:${password}@${source}?retryWrites=true&w=majority`;
const sourceClient = new Mongo(sourceUri);
const sourceDB = sourceClient.getDB(sourceUri.split('/')[3].split('?')[0]);

const targetUri = `mongodb+srv://${username}:${password}@${target}?retryWrites=true&w=majority`;
const targetClient = new Mongo(targetUri);
const targetDB = targetClient.getDB(targetUri.split('/')[3].split('?')[0]);

const collections = sourceDB.getCollectionNames();

collections.forEach(function(collectionName) {
    const sourceCollection = sourceDB.getCollection(collectionName);
    const targetCollection = targetDB.getCollection(collectionName);

    sourceCollection.find().forEach(function (doc) {
        targetCollection.insertOne(doc);
    });
});

print('printing collections in target...');
const targetCollections = targetDB.getCollectionNames();
targetCollections.forEach(function (collection) {
    print(collection);
});
