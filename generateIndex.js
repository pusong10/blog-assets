const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

// Configure marked to support tables
marked.setOptions({
    gfm: true, // Enable GitHub Flavored Markdown (GFM) to support tables, strikethrough, etc.
    breaks: true, // Enable line breaks
    headerIds: false, // Disable automatic IDs in headers
  });

  // Define paths
const inputDir = path.join(__dirname, 'posts');
const outputDir = path.join(__dirname, 'output');

// CSS Template
const stylesCSS = `
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body, html {
  height: 100%;
  font-family: Arial, sans-serif;
}

header {
  background-color: #f1f1f1;
  padding: 10px;
  text-align: center;
}

h1 {
  margin: 0;
  font-size: 24px;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  text-align: center;
}

.post-title {
  cursor: pointer;
  color: blue;
  text-decoration: underline;
  margin-bottom: 10px;
}

.post-summary {
  font-style: italic;
  margin-bottom: 20px;
}

.post-content {
  padding: 10px 0;
}

button {
  padding: 10px 20px;
  margin-top: 20px;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 16px;
  border-radius: 5px;
  text-decoration: none;
}

button:hover {
  background-color: #0056b3;
}

footer {
  margin-top: 20px;
  text-align: center;
  padding: 10px;
  position: relative;
  bottom: 0;
  width: 100%;
  background-color: #f1f1f1;
}

footer p {
  margin: 0;
  font-size: 14px;
  color: #666;
}
`;

const postHTMLTemplate = (title, summary, content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header>
    <h1>Blog</h1>
  </header>
  <div class="content-wrapper">
    <h2 class="post-title">${title}</h2>
    <p class="post-summary">${summary}</p>
    <div class="post-content">${content}</div>
    <button onclick="window.location.href='index.html'">Back to Home</button>
  </div>
  <footer>
    <p>&copy; 2024 Your Blog Name. All rights reserved.</p>
  </footer>
</body>
</html>
`;

const postListItemHTMLTemplate = (title, summary, postFile) => `
  <div class="post">
    <h2 class="post-title">
      <a href="${postFile}">${title}</a>
    </h2>
    <p class="post-summary">${summary}</p>
  </div>
`;

const indexHTMLTemplate = (postsHTML) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blog Index</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header>
    <h1>Blog Index</h1>
  </header>
  <div class="content-wrapper">
    <div id="posts-list">
      ${postsHTML}
    </div>
  </div>
  <footer>
    <p>&copy; 2024 Your Blog Name. All rights reserved.</p>
  </footer>
</body>
</html>
`;


class BlogPostProcessor {
  constructor(inputDir, outputDir) {
    this.inputDir = inputDir;
    this.outputDir = outputDir;

    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir);
    }
  }

  // Method to process all Markdown files
  processPosts() {
    const markdownFiles = this._getMarkdownFiles();
    let indexPostsHTML = ''; // This will hold the list of post titles and summaries for the index page

    markdownFiles.forEach(file => {
      const postPath = path.join(this.inputDir, file);
      const postContent = this._readFile(postPath);
      const { title, summary, htmlContent } = this._convertMarkdownToHTML(postContent);

      // Generate individual post HTML
      const postFilePath = path.join(this.outputDir, `${path.basename(file, '.md')}.html`);
      this._writeToFile(postFilePath, postHTMLTemplate(title, summary, htmlContent));

      // Add link to this post on the index page
      indexPostsHTML += postListItemHTMLTemplate(title, summary, path.basename(postFilePath));
    });

    return indexPostsHTML; // Return the HTML for all posts that will be included in the index page
  }

  // Method to write to a file
  _writeToFile(filePath, content) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Written to ${filePath}`);
  }

  // Method to read a file content
  _readFile(filePath) {
    return fs.readFileSync(filePath, 'utf-8');
  }

  // Method to get all Markdown files in the input directory
  _getMarkdownFiles() {
    return fs.readdirSync(this.inputDir).filter(file => file.endsWith('.md'));
  }

  // Method to convert Markdown content to HTML
  _convertMarkdownToHTML(markdownContent) {
    const htmlContent = marked(markdownContent);
    const title = markdownContent.split('\n')[0].replace(/^#\s*/, ''); // Extract title from first heading
    const summary = htmlContent.split('<p>')[1]?.split('</p>')[0] || 'No summary available'; // Extract the first paragraph as summary

    return { title, summary, htmlContent };
  }

  // Method to generate the index.html file
  generateIndexPage(postsHTML) {
    const indexHTML = indexHTMLTemplate(postsHTML);
    const indexFilePath = path.join(this.outputDir, 'index.html');
    this._writeToFile(indexFilePath, indexHTML);
  }

  // Method to generate the styles.css file
  generateStyles() {
    const stylesFilePath = path.join(this.outputDir, 'styles.css');
    this._writeToFile(stylesFilePath, stylesCSS);
  }
}

// Instantiate the BlogPostProcessor class and run the process
const processor = new BlogPostProcessor(inputDir, outputDir);
const postsHTML = processor.processPosts();
processor.generateStyles();
processor.generateIndexPage(postsHTML);

console.log('Blog processing completed!');
