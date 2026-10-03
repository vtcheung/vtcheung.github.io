# 内容上传与分类

所有媒体文件放入 `public` 文件夹；所有文字清单放入 `public/content`。图片与音频文件名请使用英文、数字、横线，例如 `yunnan-sunrise.jpg`、`late-bus-home.mp3`。

## 1. 旅行

- 图片放到：`public/images/travel/`
- 首页旅行入口：`public/content/travel.md`
- 单次旅行详情：`public/content/trips/你的旅行名.md`

新增旅行的步骤：复制 `iceland-ring-road.md`，改名为英文，例如 `yunnan-2025.md`；再到 `travel.md` 新增一段入口卡，`slug` 必须等于文件名（不含 `.md`）。

旅行相册每张图片这样写，竖线后的三项会在放大预览中显示：

```md
![地点 | 2025.07.12 | Sony A7IV · 35mm · f/2](/images/travel/yunnan-sunrise.jpg)
```

旅行详情只需要写 `## Intro`、`## Route`、`## Album` 三个标题；日程安排已经不再显示。

## 2. 声音收藏（歌单）

- 音频放到：`public/music/`
- 歌单首页卡片：`public/content/playlists.md`
- 单份歌单：`public/content/playlists/歌单名.md`

复制 `cozy-vintage-jazz.md` 后，在歌单中每首歌用下面格式添加：

```md
### 曲名
artist: 作者
duration: 03:42
audio: /music/song-file.mp3
```

点击“播放歌单”会从第一首开始顺序播放；播放到结尾会自动播放下一首。右下角播放器会显示当前歌曲。

## 3. 书籍

- 书籍首页卡片：`public/content/journal/books.md`
- 单本书与摘抄：`public/content/books/书名.md`

首页卡片的 `slug` 对应详情文件名。详情文件中，所有 `## Quotes` 下以 `- ` 开头的行都是一条摘抄。

## 4. 影视

只编辑 `public/content/journal/films.md`。每一条的 `date` 使用 `年 · 月`，例如 `2026 · 09`；页面会按你在文件中的先后顺序显示为时间线。

## 5. 音乐随笔（专辑）

- 专辑首页卡片：`public/content/journal/music.md`
- 专辑曲目：`public/content/albums/专辑名.md`

格式与歌单完全相同。专辑和声音收藏共用同一个播放器，所以同一时刻只会播放一首歌。
