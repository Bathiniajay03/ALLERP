const fs = require('fs');
const path = 'src/index.css';
let content = fs.readFileSync(path, 'utf8');

// Inject global root font-size to scale down the entire application for dense enterprise look
if (!content.includes('html {')) {
  const globalScaleCSS = `
/* Global scaling to prevent "zoomed in" look on Windows laptops with high DPI scaling */
html {
  font-size: 13px; /* Scales down 1rem from 16px to 13px (approx 81%), effectively simulating a zoomed-out view */
}
`;
  content = globalScaleCSS + content;
  fs.writeFileSync(path, content);
  console.log("Successfully scaled down global UI in index.css");
} else {
  console.log("Already scaled");
}
