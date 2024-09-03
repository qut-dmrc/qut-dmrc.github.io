import fs from 'fs';
import path from 'path';
import childProcess from 'child_process';

let __dirname = new URL('../', import.meta.url).pathname;

/*function chmodDirectory(directoryPath) {
  try {
    childProcess.execSync(`chmod -R 755 "${directoryPath}"`, { stdio: 'inherit' });
    console.log(`Successfully changed permissions for directory: ${directoryPath}`);
  } catch (error) {
    console.error(`Failed to change permissions for directory: ${directoryPath}. Error: ${error}`);
    process.exit(1); // Exit with non-zero status code on failure
  }
}

chmodDirectory(__dirname);*/

async function copyIndexTo404() {
  const indexPath = path.join(__dirname,'index.html');
  const targetPath = path.join(__dirname, '404.html');

  try {
    // Copy the index.html file to 404.html
    fs.copyFileSync(indexPath, targetPath);

    console.log('Contents copied successfully.');
  } catch (error) {
    console.error('An error occurred:', error);
  }

}

copyIndexTo404();