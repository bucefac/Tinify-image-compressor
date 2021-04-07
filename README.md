# Image comporessor for Node.js
Uses [Tinify](https://tinypng.com/) API client

## Usage
```
npm install
node app.js --help
Options:
      --help         Show help
      -d, --dir      directory with compressible images
                                            [string] [default: "./"]
      -f, --files    compressible images                     [array]
      -l, --limit    limit of iterations      [number] [default: 20]
      -k, --key      developer API key from https://tinify.com/dashboard/api
                                                    [string] [required]
```
