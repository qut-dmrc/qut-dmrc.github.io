import fs from 'fs';

async function copyIndexTo404() {
  const indexPath = './index.html';
  const targetPath = './404.html';

  // Check if both files exist
  if (!fs.existsSync(indexPath)) {
    console.error(`Error: ${indexPath} does not exist.`);
    return;
  }

  if (!fs.existsSync(targetPath)) {
    console.log(`Creating new file: ${targetPath}`);
  }

  try {
    // Read the contents of index.html
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    
    // Write the contents to 404.html
    fs.writeFileSync(targetPath, indexContent);

    console.log('Contents copied successfully.');
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

copyIndexTo404();