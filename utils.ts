import chalk from 'chalk'

interface CommonObj {
  [key: string]: string
}

/**
 * 获取node命令行参数
 */
export function getProcessArgs() {
  return process.argv.slice(2).reduce((pre: CommonObj, cur: string) => {
    const temp = cur.split('=')
    pre[temp[0]] = temp[1]
    return pre
  }, <CommonObj>{})
}

export function SuccessLog(str: string) {
  console.log(chalk.white.bgGreen(str))
}

export function WarnLog(str: string) {
  console.log(chalk.yellow(str))
}

export function ErrorLog(str: string) {
  console.log(chalk.white.bgRed(str))
}

export function NormalLog(str: string) {
  console.log(str)
}

/**
 * 有时标题上会出现一些特殊字符，导致文件无法正常写入，因此在写入前增加一层转码
 * @param str 目标字符换
 *
 * '/' ---> '|'
 */
export function transCode(str: string) {
  return str.replace('/', '|')
}
