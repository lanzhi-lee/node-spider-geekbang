import fs from 'fs'
import chalk from 'chalk'
import Axios from 'axios'
import { sleep } from 'sleep'

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
        console.log('err')
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
        console.log(chalk.white.bgRed(`err in getSigleArticleContent ${id}`))
        resolve({ title: '', result: '' })
      })
  })
}

// console.log(chalk.white.bgRed(`> Error: The config file is not exist! Please read README.md first! `))
// process.exit(0)
// note 主函数
;(async () => {
  // 配置文件检测
  if (!fs.existsSync('./config.ts')) {
    console.log(chalk.white.bgRed(`> Error: The config file is not exist! Please read README.md first! `))
    process.exit(1)
  }

  // 初始化输出目录
  if (!fs.existsSync('./output/')) fs.mkdirSync('./output/')

  // 初始化请求列表
  let articles = await getArticleList(courseInfo)
  if (errList.length) articles = errList
  else articles = await getArticleList(courseInfo)
  // console.log(articles)

  // 主逻辑
  let curIndex = 0
  const curErrList = []
  while (curIndex < articles.length) {
    const info = articles[curIndex]

    console.log(`request ${info.id} ---> ${info.title}\n`)
    const data = await getSigleArticleContent(info.id)

    if (data.title) {
      fs.writeFileSync(`./output/${data.title.replace('/', '|')}.md`, data.result)
      console.log(chalk.white.bgGreen(`write ${data.title} successfully \n`))
    } else {
      curErrList.push(info)
    }

    sleep(5)
    curIndex++
  }

  if (!curErrList.length) console.log(chalk.white.bgGreen('all successful'))
  else {
    console.log(chalk.yellow('\n> Error in get: '))
    console.log(curErrList)
    console.log(chalk.yellow('> You can copy the above array to config.ts.errList and try again'))
  }
})()
