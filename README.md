# node-spider-geekbang

如题，就是一个抓取极客邦内容的爬虫

### 前置条件

白嫖是不可能白嫖的，想要抓取某个课程，首先必须要订阅了对应的课程，所以首先需要一个大善人去订阅

### 基本使用

推荐使用 yarn，当然 npm 也是没毛病的

```bash
yarn                    # 安装依赖
```

复制`config.ts.local`更名为`config.ts`，修改其中的配置

```bash
yarn start              # 执行主文件
# or
npx ts-node index.ts    # 执行主文件
```

#### 输出目录

默认输出文件夹为`./output/`，如需自定义，可添加`targetDir`参数，例如：

```bash
yarn start targetDir=重学前端
```

此时，文件将会保存在`./output/重学前端`下

#### 文件合并

课程被抓取后每节以单个文件的形式保存，如果觉得这样文件太多，可以选择进行文件合并：

```bash
yarn merge targerDir=重学前端
```

此时将会把`./output/重学前端`下的文件全部合并，生成`重学前端.md`

注意：`targerDir`这个参数是必须的，它既是将要合并文件的目标目录，也是生成文件的文件名

### FAQ

- todo...
