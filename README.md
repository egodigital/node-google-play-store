[![npm](https://img.shields.io/npm/v/@egodigital/google-play-store.svg)](https://www.npmjs.com/package/@egodigital/google-play-store)

# @egodigital/google-play-store

A simplfied library for [Node.js 10+](https://nodejs.org/docs/latest-v10.x/api/) for accessing Google's Play Store APIs, written in [TypeScript](https://www.typescriptlang.org/).

The module is quite new, so [issues](https://github.com/egodigital/node-google-play-store/issues) and [pull requests](https://github.com/egodigital/node-google-play-store/pulls) are very welcome :-)

## Install

Execute the following command from your project folder, where your `package.json` file is stored:

```bash
npm install --save @egodigital/google-play-store
```

## Usage

```typescript
import * as fs from 'fs';
import { Client as GooglePlayStoreClient } from '@egodigital/google-play-store';

const PRIVATE_KEY = fs.readFileSync(
    '/path/to/your/json/key/file'
);

const CLIENT = new GooglePlayStoreClient({
    key: PRIVATE_KEY,
});

const SUMMARY = await CLIENT.getAppDownloads({
    projectId: '<YOUR-PROJECT-ID>',
});

console.log(
    SUMMARY
);
```

## Documentation

The API documentation can be found [here](https://egodigital.github.io/google-play-store/).
