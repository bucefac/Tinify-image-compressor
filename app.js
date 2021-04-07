#!/usr/bin/env node
const fs = require('fs')
const tinify = require('tinify')
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

function formatSize (bytes) {
  return bytes ? `${(bytes / 1024).toFixed(2)}Kb` : '0'
}

async function compressFile (file, limit) {
  let attempt = 0
  const fileName = file.split('/').pop()
  const initSize = fs.statSync(file).size
  let currSize = initSize
  let compressedSize = initSize
  console.log('Compress file', fileName, formatSize(initSize))
  try {
    let buffer = fs.readFileSync(file)
    while (attempt < limit) {
      attempt++
      buffer = await tinify.fromBuffer(buffer).toBuffer()
      compressedSize = Buffer.byteLength(buffer)
      if (compressedSize >= currSize) {
        break
      } else if (attempt === limit) {
        console.log('Limit of attempts reached', limit)
      }
      currSize = compressedSize
    }
    fs.writeFileSync(file, buffer)
    console.log('Result size', formatSize(compressedSize), 'Profit', formatSize(initSize - compressedSize))
  } catch (e) {
    console.error('Compress failed', fileName)
    console.error(e)
  }
}

async function compress (key, files, limit) {
  try {
    tinify.key = key
    await tinify.validate()
    console.log(`You did ${tinify.compressionCount} compressions this month`)
  } catch (e) {
    console.error('Validation of API key failed')
    process.exit(1)
  }
  for (let i = 0; i < files.length; i++) {
    await compressFile(files[i], limit)
    console.log(`${files.length - 1 - i} left`)
  }
}

function initFiles (dir, files = []) {
  const FILES = []
  if (files.length) {
    for (file of files) {
      try {
        const fileName = `${dir}/${file}`
        const fd = fs.openSync(fileName, 'rwx')
        FILES.push(fileName)
        fs.close(fd)
      } catch (e) {
        console.error('Skip file', file)
      }
    }
  } else {
    const isImage = (file) => /\.(png|jpg)$/.test(file)
    FILES.push(...fs.readdirSync(dir).filter(isImage).map(img => `${dir}${img}`))
  }
  return FILES
}

const argv = yargs(hideBin(process.argv))
  .option('dir', {
    alias: 'd',
    type: 'string',
    description: 'directory with compressible images',
    default: './',
  })
  .option('files', {
    alias: 'f',
    type: 'array',
    description: 'compressible images',
  })
  .option('limit', {
    alias: 'l',
    type: 'number',
    default: 20,
    description: 'limit of iterations',
  })
  .option('key', {
    alias: 'k',
    type: 'string',
    required: true,
    description: 'developer API key from https://tinify.com/dashboard/api',
  })
  .argv

const files = initFiles(argv.dir, argv.files)
if (files.length) {
  console.log(`${files.length} file(s) will be compressed`)
  compress(argv.key, files, argv.limit)
} else {
  console.log('No files to compress')
  process.exit()
}
