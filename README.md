[![npm](https://img.shields.io/npm/v/@egodigital/google-play-store.svg)](https://www.npmjs.com/package/@egodigital/google-play-store)

# @egodigital/google-play-store

A simplified library for [Node.js 10+](https://nodejs.org/docs/latest-v10.x/api/) for accessing Google's Play Store APIs, written in [TypeScript](https://www.typescriptlang.org/).

The module is quite new, so [issues](https://github.com/egodigital/node-google-play-store/issues) and [pull requests](https://github.com/egodigital/node-google-play-store/pulls) are very welcome :-)

## Install

Execute the following command from your project folder, where your `package.json` file is stored:

```bash
npm install --save @egodigital/google-play-store
```

## Usage

### Get App Downloads
```typescript
import {Client, ClientOptions} from "@egodigital/google-play-store";

const clientOptions: ClientOptions = {
    keyPath: '/path/to/your/api/key/json/file',
};

const client = Client.create(clientOptions);

const summary = await client.getAppDownloads({
    projectId: '<YOUR-PROJECT-ID>',
});

console.log(
    summary
);
```

### Upload a build

```typescript
import {Client, ClientOptions} from "@egodigital/google-play-store";

const clientOptions: ClientOptions = {
    keyPath: '/path/to/your/api/key/json/file',
};

const client = Client.create(clientOptions);

const run = async () => {
    await client.uploadBuild('com.example.app', '/path/to/your/apk');
}

run().then().catch((e: Error) => {
    console.error(`Error: ${e.message}`);
    console.debug(`Stack: ${e.stack}`);
    process.exit(1);
});
```

### Add build to group (track)

```typescript
import {Client, ClientOptions} from "@egodigital/google-play-store";

const clientOptions: ClientOptions = {
    keyPath: '/path/to/your/api/key/json/file',
};

const client = Client.create(clientOptions);

const run = async () => {

    const packageName = 'com.example.app';
    await client.addBuildToTestingGroup(packageName, 48, '1.0.25', 'alpha');
}

run().then().catch((e: Error) => {
    console.error(`Error: ${e.message}`);
    console.debug(`Stack: ${e.stack}`);
    process.exit(1);
});
```

### Submit an app for production review

```typescript
import {Client, ClientOptions} from "@egodigital/google-play-store";

const clientOptions: ClientOptions = {
    keyPath: '/path/to/your/api/key/json/file',
};

const client = Client.create(clientOptions);

const run = async () => {
    await client.submitForReview('com.example.app', '1.0.25');
}

run().then().catch((e: Error) => {
    console.error(`Error: ${e.message}`);
    console.debug(`Stack: ${e.stack}`);
    process.exit(1);
});
```

### Set other information while submitting a build for production review
```typescript
import {Client, ClientOptions} from "@egodigital/google-play-store";

const clientOptions: ClientOptions = {
    keyPath: '/path/to/your/api/key/json/file',
};

const client = Client.create(clientOptions);

const run = async () => {
    await client.submitForReview('com.example.app', '1.0.25', {
        autoAttachVersionCode: 48,
        releaseNotes: [
            {
                lang: 'en-US',
                text: 'New and awesome features'
            }
        ],
        details: {
            defaultLanguage: 'en-US',
            contactWebsite: 'https://bestapp.com',
            contactEmail: 'john.doe@bestapp.com',
            contactPhone: '777-555-6666'
        },
        // Note! Your API key must have sufficient privileges to manage listings
        listings: [
            {
                language: 'en-US',
                title: 'BestApp',
                fullDescription: 'The best app of all time that has everything you ever wanted and needed',
                shortDescription: 'A really great app',
                video: 'https://youtube.com/?v=link-to-my-video'
            }
        ]
    });
}

run().then().catch((e: Error) => {
    console.error(`Error: ${e.message}`);
    console.debug(`Stack: ${e.stack}`);
    process.exit(1);
});
```

## Documentation

The API documentation can be found [here](https://egodigital.github.io/google-play-store/).
