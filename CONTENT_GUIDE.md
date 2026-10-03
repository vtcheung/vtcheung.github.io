# 内容编辑说明

所有图片、音乐和文字都放在 `public` 文件夹；你只编辑 `public/content` 内的 Markdown（`.md`）文件，不需要修改 `src` 文件夹。

## 添加一段新旅行

1. 在 `public/images` 新建 `travel` 文件夹。
2. 将照片拖进去，例如 `kyoto.jpg`。文件名请用英文、数字或横线，不使用空格。
3. 复制 `public/content/trips/iceland-ring-road.md`，在同一文件夹粘贴后重命名，例如 `yunnan-2025.md`。
4. 打开新文件，修改顶部的标题、日期、封面，再按需要填写“旅行介绍”“路线”“行程”和“相册”。相册图片直接按 Markdown 格式逐行添加：

```md
![洱海日出](/images/travel/yunnan-sunrise.jpg)
```

5. 打开 `public/content/travel.md`，在最后加入一张“旅行入口卡”：

```md
---
slug: yunnan-2025
title: 云南慢行 · 夏日山谷
date: 2025.07 · 6 DAYS
cover: /images/travel/yunnan-cover.jpg
---
这是一段六天的旅行。
```

## 添加音乐

1. 将 MP3 文件拖到 `public/music`，如 `my-song.mp3`。
2. 打开 `public/content/music.md`，在最底部粘贴：

```md
---
title: 我的新作品
detail: Ambient · 03:42
audio: /music/my-song.mp3
---
```

## 添加书、电影或音乐随笔

打开对应的 `public/content/journal/books.md`、`films.md` 或 `music.md`，然后在底部粘贴：

```md
---
title: 作品标题
author: 作者或导演
rating: 5
image: /images/journal/cover.jpg
---
这里写一两句你的微评。
```

`rating` 填写 1 到 5。封面图片放在 `public/images/journal`。

## 查看更改

保存 Markdown 或替换媒体文件后，网页一般会自动更新；没有更新就按 `Ctrl + R` 刷新。

每张卡片都由 `---` 分隔，请保留它们。文件名必须和 Markdown 内写的路径完全一致。
