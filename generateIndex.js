const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

// Define paths
const inputDir = path.join(__dirname, 'posts');
const outputDir = path.join(__dirname, 'output');

// CSS Template
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

.post-content.visible {
  display: block;
}
`;

// HTML Template for individual posts
const htmlTemplate = (title, summary, content) => `
  <div class="post">
    <h2 class="post-title" onclick="toggleContent(this)">${title}</h2>
    <p class="post-summary">${summary}</p>
    <div class="post-content">${content}</div>
  </div>
`;

// HTML Template for the index page
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
  <h1>Blog Index</h1>
  <div id="posts-list">${postsHTML}</div>
  <script>
    function toggleContent(element) {
      const contentDiv = element.nextElementSibling.nextElementSibling;

      contentDiv.classList.toggle('visible');
    }
  </script>
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
    const posts = this._getMarkdownFiles();
    let postsHTML = '';

    posts.forEach(postFile => {
      const postPath = path.join(this.inputDir, postFile);
      const postContent = this._readFile(postPath);
      const { title, summary, htmlContent } = this._convertMarkdownToHTML(postContent);

      postsHTML += htmlTemplate(title, summary, htmlContent);
      
      // Write HTML for individual post to the output directory
      const outputFilePath = path.join(this.outputDir, `${path.basename(postFile, '.md')}.html`);
      this._writeToFile(outputFilePath, htmlContent);
    });

    return postsHTML;
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
