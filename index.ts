import fs from 'fs'
import chalk from 'chalk'
import Axios from 'axios'
import { sleep } from 'sleep'
import { getProcessArgs, ErrorLog, WarnLog, SuccessLog, NormalLog } from './utils'

import { Headers, courseInfo, errList } from './config'

declare interface CommonObj {
  [key: string]: string
}

declare interface ArticleInfo {
  id: string
  title: string
  summary: string
}

type CourseInfo = typeof courseInfo

/**
 * 获取某课程的节列表
 * @param courseInfo
 */
function getArticleList(courseInfo: CourseInfo) {
  return new Promise<ArticleInfo[]>((resolve) => {
    Axios.get('https://time.geekbang.org/serv/v1/column/articles', {
      headers: Headers,
      // note data 是下面酱婶儿的
      // { cid: 189, size: 100, prev: 0, order: 'earliest', sample: false },
      data: courseInfo,
    })
      .then((res) => {
        // console.log(res.data.data)

        const data = res.data.data.list
        const list: ArticleInfo[] = data.reduce((pre: ArticleInfo[], cur: CommonObj) => {
          pre.push({
            id: cur.id,
            title: cur.article_title,
            summary: cur.article_summary,
          })

          return pre
        }, [])

        resolve(list)
      })
      .catch((err) => {
        ErrorLog('> Error in getArticleList')
        resolve([])
      })
  })
}

/**
 * 获取单节的详细文本
 * @param id 对应每节的id，从 articles 中获取
 */
function getSigleArticleContent(id: string) {
  return new Promise<{ title: string; result: string }>((resolve) => {
    Axios.get('https://time.geekbang.org/serv/v1/article', {
      headers: Headers,
      data: { id, include_neighbors: true, is_freelyread: true },
    })
      .then((res) => {
        // console.log(res.data.data)
        const data = res.data.data
        const title: string = data.article_title
        const summary: string = data.article_summary
        const content: string = data.article_content

        const result = `## ${title}\n\n ${summary}\n\n ${content}\n\n`
        resolve({ title, result })
      })
      .catch((err) => {
        ErrorLog(`> Error in getSigleArticleContent ${id}`)
        resolve({ title: '', result: '' })
      })
  })
}

// note 主函数
;(async () => {
  // 配置文件检测
  if (!fs.existsSync('./config.ts')) {
    ErrorLog(`> Error: The config file is not exist! Please read README.md first!`)
    process.exit(1)
  }

  // 获取node命令行参数
  const processArgs = getProcessArgs()

  // 初始化输出目录
  if (!fs.existsSync('./output/')) fs.mkdirSync('./output/')

  // 自定义目录支持
  let targetDir = './output/'
  if (processArgs.targetDir) {
    targetDir = `./output/${processArgs.targetDir}`

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir)
      SuccessLog(`Create Custom output directory "${targetDir}" successfully \n`)
    }
  }

  // 初始化请求列表
  let articles = await getArticleList(courseInfo)
  if (errList.length) articles = errList
  else articles = await getArticleList(courseInfo)
  // 节列表获取失败直接退出进程
  if (!articles.length) process.exit(1)
  // console.log(articles)

  // 主逻辑
  let curIndex = 0
  const curErrList = []
  while (curIndex < articles.length) {
    const info = articles[curIndex]

    NormalLog(`> request ${info.id} ---> ${info.title}`)
    const data = await getSigleArticleContent(info.id)

    if (data.title) {
      const prefix = `${curIndex}`.padStart(2, '0')
      const fileName = `${prefix}-${data.title.replace('/', '|')}.md`
      try {
        fs.writeFileSync(`${targetDir}/${fileName}`, data.result)
        SuccessLog(`write ${fileName} successfully \n`)
      } catch (error) {
        curErrList.push(info)
        ErrorLog(`> Error in write file ${info.title}`)
      }
    } else {
      curErrList.push(info)
    }

    sleep(5)
    curIndex++
  }

  if (!curErrList.length) SuccessLog('\n\n> All successful! Enjoy!')
  else {
    WarnLog('\n> Error in get: ')
    console.log(curErrList)
    WarnLog('> You can copy the above array to config.ts.errList and try again')
  }
})()
