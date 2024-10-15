const fs = require('fs');
const path = require('path');
const marked = require('marked');

// 读取posts目录
const postsDir = path.join(__dirname, 'posts');
const posts = fs.readdirSync(postsDir).filter(file => file.endsWith('.md'));

// HTML模板
const htmlTemplate = (title, summary, content) => `
  <div class="post">
    <h2 class="post-title" onclick="toggleContent(this)">${title}</h2>
    <p class="post-summary">${summary}</p>
    <div class="post-content">${content}</div>
  </div>
`;

// 遍历Markdown文件，生成HTML
let postsHTML = '';
posts.forEach(postFile => {
  const postPath = path.join(postsDir, postFile);
  const postContent = fs.readFileSync(postPath, 'utf-8');
  const postHTML = marked(postContent);

  const title = postContent.split('\n')[0].replace(/^#\s*/, ''); // 获取第一行作为标题
  const summary = postHTML.split('<p>')[1].split('</p>')[0]; // 获取第一段作为摘要
  const content = postHTML; // 完整内容

  postsHTML += htmlTemplate(title, summary, content);
});


// 输出styles.css文件
const stylesCSS = `
body {
  font-family: Arial, sans-serif;
}

.post-title {
  cursor: pointer;
  color: blue;
  text-decoration: underline;
}

.post-summary {
  font-style: italic;
}

.post-content {
  display: none;
  padding: 10px 0;
}
`;

fs.writeFileSync('styles.css', stylesCSS, 'utf8');

// 输出HTML文件
const indexHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blog Index</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <h1>Blog Index</h1>
  <div id="posts-list">${postsHTML}</div>
  <script>
    function toggleContent(element) {
      const contentDiv = element.nextElementSibling.nextElementSibling;
      if (contentDiv.style.display === 'none') {
        contentDiv.style.display = 'block';
      } else {
        contentDiv.style.display = 'none';
      }
    }
  </script>
</body>
</html>
`;

fs.writeFileSync('index.html', indexHTML, 'utf8');
