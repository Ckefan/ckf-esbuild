#!/usr/bin/env node

const cac = require('cac') // 监听shell 命令
const glob = require('glob') // 获取当前项目的指定文件
const path = require('path')
const fs = require('fs-extra')
const esbuild = require('esbuild')
const { dtsPlugin } = require('esbuild-plugin-d.ts')

/** process.cwd() 获取当前运行命令的目录 */
const package = require(path.join(process.cwd(), 'package.json'))

const distPath = path.join(process.cwd(), 'dist')
fs.existsSync(distPath) && fs.emptyDirSync(distPath)

const cli = cac()

const globFils = async () => {
  return await new Promise((resolve) => {
    glob('src/**/*.ts', { root: process.cwd() }, function (err, files) {
      if (err) {
        console.error(err)
        process.exit(1)
      }
      if (files.length === 0) console.error('请检查文件是否在src目标下')
      resolve(files)
    })
  })
}

const buildServe = async (isPro) => {
  console.log('编译中...')
  return await esbuild
    .build({
      entryPoints: await globFils(),
      bundle: false,
      splitting: false,
      outdir: path.join(process.cwd(), 'dist'),
      format: 'cjs',
      platform: 'node',
      watch: !isPro && {
        onRebuild(err, result) {
          if (err) console.error(err)
          else {
            console.log('编译完成')
          }
        },
      },
      minify: false,
      sourcemap: false,
      color: true,
      loader: {
        // 默认使用 js loader ,手动改为 jsx-loader
        '.ts': 'tsx',
        '.tsx': 'tsx',
      },
      plugins: [dtsPlugin()],
    })
    .then((res) => {
      console.log('编译完成')
    })
    .catch((err) => {
      console.error(JSON.stringify(err), '\r\n可能当前没有tsconfig.json配置')
    })
}

/** dev start */
cli.command('dev').action(async (argv) => {
  buildServe(false)
})

/** build */
cli.command('build').action(async (argv) => {
  buildServe(true)
})

/** help */
cli.command('').action(async (argv) => {
  cli.outputHelp()
})

/** -h --help */
cli.help()
/** -v --version */
cli.version(package.version)
/** 解析生效 类似开始监听*/
cli.parse()
