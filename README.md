# EAVFW

| Project      |      Readme                               |  Version                                                                             | Dev Version                                                                              | vnext Version                                                                              |
|--------------|:-----------------------------------------:|-------------------------------------------------------------------------------------:|-----------------------------------------------------------------------------------------:|-------------------------------------------------------------------------------------------:|
| Apps         |  [Readme](src/apps/readme.md)             | ![npm](https://img.shields.io/npm/v/@eavfw/manifest?label=%40eavfw%2Fmanifest)       | ![npm](https://img.shields.io/npm/v/@eavfw/manifest/dev?label=%40eavfw%2Fmanifest)       | ![npm](https://img.shields.io/npm/v/@eavfw/manifest/vnext?label=%40eavfw%2Fmanifest)       |
| Expressions  |  [Readme](src/expressions/readme.md)      | ![npm](https://img.shields.io/npm/v/@eavfw/expressions?label=%40eavfw%2Fexpressions) | ![npm](https://img.shields.io/npm/v/@eavfw/expressions/dev?label=%40eavfw%2Fexpressions) | ![npm](https://img.shields.io/npm/v/@eavfw/expressions/vnext?label=%40eavfw%2Fexpressions) |
| Forms        |  [Readme](src/forms/readme.md)            | ![npm](https://img.shields.io/npm/v/@eavfw/forms?label=%40eavfw%2Fforms)             | ![npm](https://img.shields.io/npm/v/@eavfw/forms/dev?label=%40eavfw%2Fforms)             | ![npm](https://img.shields.io/npm/v/@eavfw/forms/vnext?label=%40eavfw%2Fforms)             |
| NextJs       |  [Readme](src/nextjs/readme.md)           | ![npm](https://img.shields.io/npm/v/@eavfw/next?label=%40eavfw%2Fnext)               | ![npm](https://img.shields.io/npm/v/@eavfw/next/dev?label=%40eavfw%2Fnext)               | ![npm](https://img.shields.io/npm/v/@eavfw/next/vnext?label=%40eavfw%2Fnext)               |
| Hooks        |  [Readme](src/hooks/readme.md)            | ![npm](https://img.shields.io/npm/v/@eavfw/hooks?label=%40eavfw%2Fhooks)             | ![npm](https://img.shields.io/npm/v/@eavfw/hooks/dev?label=%40eavfw%2Fhooks)             | ![npm](https://img.shields.io/npm/v/@eavfw/hooks/vnext?label=%40eavfw%2Fhooks)             |
| Utils        |  [Readme](src/utils/readme.md)            | ![npm](https://img.shields.io/npm/v/@eavfw/utils?label=%40eavfw%2Futils)             | ![npm](https://img.shields.io/npm/v/@eavfw/utils/dev?label=%40eavfw%2Futils)             | ![npm](https://img.shields.io/npm/v/@eavfw/utils/vnext?label=%40eavfw%2Futils)             |
| CodeEditor   |  [Readme](src/codeeditor/readme.md)       | ![npm](https://img.shields.io/npm/v/@eavfw/codeeditor?label=%40eavfw%2Fcodeeditor)   | ![npm](https://img.shields.io/npm/v/@eavfw/codeeditor/dev?label=%40eavfw%2Fcodeeditor)   | ![npm](https://img.shields.io/npm/v/@eavfw/codeeditor/vnext?label=%40eavfw%2Fcodeeditor)   |

 
This repository contains the specification of the EAVFW Manifest.

With the specification the following are distributed:
 - type definitions for typescript development is distributed on NPM.
 - JSON Schema for the json file



 ## How to link and use EAV Locally
 Clone this project locally
 From EAV cloned project locally run:
 ```
 npm run link
 ```

 then from target project run
 ```
 npm link @eavfw/apps @eavfw/next @eavfw/expressions @eavfw/manifest @eavfw/hooks @eavfw/forms @eavfw/utils
 ```

 often shorthanded in package.json
 ```
 npm run linkEAV
 ```
