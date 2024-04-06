# Meta-Hash

Meta-Hash is a TypeScript library designed to monitor a specified folder and compute hashes for any new files detected within it. This library leverages an index system to avoid recomputing hashes if the program is restarted, ensuring efficiency and continuity in hash computation. The hashes are computed in the Content Identifier (CID) format, making them compatible with systems like IPFS (InterPlanetary File System).

## Features

- **Efficient Hash Computation**: Automatically computes hashes for new files using multiple algorithms, including SHA2-256, SHA1, MD5, SHA3-256 and more.
- **Persistent Indexing**: Utilizes an index system to record file hashes, sizes, and modification times, preventing the need for rehashing on program restarts.
- **CID Format**: Hashes are stored in the CID format, facilitating integration with IPFS and similar distributed file systems.

## CID Format and Inspection

The Content Identifier (CID) is a label used to point to material in IPFS. It doesn't indicate where the content is stored, but it forms a kind of address based on the content itself. CIDs are used as a standard way of pointing to pieces of information. A single CID can represent a piece of content that is distributed across multiple systems.

The list of CID formats used in this project can be found at the following link:
[Multicodecs Table](https://ipfs.io/ipfs/QmXec1jjwzxWJoNbxQF5KffL8q6hFXm9QwUGaa3wKGk6dT/#title=Multicodecs&src=https://raw.githubusercontent.com/multiformats/multicodec/master/table.csv)

To inspect the details of a CID, including its version, codec, multihash and more, you can use the CID Inspector tool. This tool allows you to enter a CID and it will break it down into its component parts and provide a detailed explanation of each part.

[CID Inspector Tool](https://cid.ipfs.tech/)

## Installation

To use Meta-Hash in your project, clone this repository and install the required dependencies.

```bash
#to install
yarn add @metazla/meta-hash@git@github.com:Metazla/meta-hash.git

#to update
yarn up -i @metazla/meta-hash
```

## Usage of ComputeHashIndexCache

To integrate Meta-Hash into your application, follow these steps:

1. **Import the Library**: Import the necessary components from the library.

```typescript
import { ComputeHashIndexCache, CID_ALGORITHM_NAMES } from "./folder-watch-hasher";
```

2. **Initialize the Watcher**: Create an instance of `ComputeHashIndexCache`, specifying the path to the folder you want to monitor and the hash algorithms you wish to use.

```typescript
//note that the csv file will be derived from the path provided into multiple files (one for each algorithm)
const computer = new ComputeHashIndexCache("path/to/your/indexfile/index.csv", [CID_ALGORITHM_NAMES.sha256, CID_ALGORITHM_NAMES.sha1]);
```

3. **Compute Hashes**: Invoke the `computeMissingHash` method for each file you wish to hash. This method will automatically check the index for existing hashes and compute missing ones.

```typescript
let hash:MultiHashData = {};
await computer.computeMissingHash("path/to/your/file.txt", hash);
console.log(hash[CID_ALGORITHM_NAMES.sha256]);
```

## Example of Index File

An example index file (`index-cid_sha2-256.csv`) is shown below, demonstrating how file paths, sizes, modification times, and computed hashes are stored:

```
path,size,mtime,cid_sha2-256
file.mkv,230265591,2023-01-17T18:53:37.692Z,baejbeif45glg263244x7cbjzyd3ssp5edzae7bxurzxjhnogazcwmj32wa
...
```

## Contributing

Contributions to Meta-Hash are welcome! Please read our contributing guidelines for more information on how to participate.

## License

Meta-Hash is released under the [MIT License](LICENSE.md).
