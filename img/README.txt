把作品图放进这个目录，文件名必须是下面这些（区分大小写）。
扩展名支持 .jpg / .jpeg / .png / .webp / .avif / .gif，脚本会自动识别，不用改代码。
注意：手机 / 小红书导出的 .heic 浏览器显示不了，请先转成 .jpg 或 .png。

★ 轮播背景图（放这一张，效果最明显）
  首屏轮播每个画师一张，原图直接铺满整个 slide —— 不蒙版、不雾化、不调色。

     bg-xuyoudian.jpg     徐尤点 轮播背景
     bg-dino.jpg          Dino   轮播背景
     bg-miyama.jpg        米山舞 轮播背景

  取景焦点（画面被裁到哪里）在 index.html 的 theme.bgPos 里调：
     '50% 8%'  = 横向居中、纵向取靠上的 8%（竖构图人像用这个，能保住头）
     '50% 50%' = 正中间（横构图用）

  文字压在画上，靠一块毛玻璃底板保证可读（图片本身没被动过）：
     浓度在 CSS 的 .slide--art .slide__right 里调（rgba 最后一位，越大字越清楚）
     不想要底板就删掉那条规则 —— 但正文压在画面上基本读不清，不建议

  建议：横构图或方构图，短边 ≥1200px。竖构图也能用，靠 bgPos 取景。

作品图（出现在：轮播缩略图 → 作品集卡片 → 点开的大图）
     xuyoudian-1.jpg  xuyoudian-2.jpg  xuyoudian-3.jpg
     dino-1.jpg       dino-2.jpg       dino-3.jpg
     miyama-1.jpg     miyama-2.jpg     miyama-3.jpg
  建议 4:3 或 16:10 横构图，短边 ≥1000px；竖构图可在作品数据里加 pos:'50% 20%' 调取景。

头像（首屏圆形头像，覆盖原来的渐变 + 姓氏占位）
     avatar-xuyoudian.jpg  avatar-dino.jpg  avatar-miyama.jpg
  建议正方形，短边 ≥400px。

—————————————————————————————————————————————
放好之后，在本目录的上一级执行：

  node tools/inline-images.mjs

脚本会把图片转成 base64 内联进 index.html —— 页面仍然是单文件、零外链、零 404，
双击即可打开。其它命令：

  node tools/inline-images.mjs --check    只检查图片是否齐全，不改文件
  node tools/inline-images.mjs --clear    清空内联图片，回到 SVG 占位插画

缺图的位置不会被破坏：没找到的槽位继续使用原来的内联 SVG 插画 / 主题渐变。
