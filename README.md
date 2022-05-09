# EAVFW.Manifest
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