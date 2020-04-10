import fs from 'fs'
import { getProcessArgs, ErrorLog, WarnLog, NormalLog } from './utils'

// 获取node命令行参数
const { targerDir } = getProcessArgs()

if (!targerDir) {
  ErrorLog(`> Parameter "targerDir" must be provided,but not be found！`)
  process.exit(1)
}

const finalTargerDir = `./output/${targerDir}/`
const finalFileName = `${finalTargerDir}${targerDir}.md`

WarnLog(`> This operation will merge all files under ${finalTargerDir} into a file called "${targerDir}.md"`)
WarnLog(`> So I guess you know exactly what you are doing!\n`)

const fileList = fs.readdirSync(`./output/${targerDir}`)

// 文件较小，因此可通过同步方法直接合并
fileList.forEach((filename) => {
  fs.appendFileSync(finalFileName, fs.readFileSync(`${finalTargerDir}${filename}`))
  NormalLog(`> merging ${filename}`)
})
