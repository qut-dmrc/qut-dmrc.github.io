import fs from 'fs';
import path from 'path';

let __dirname = new URL('../', import.meta.url).pathname;
  
function copyPackageSubfolderJsFiles(packages, subfolders, destinationPath) {
    const modulePath = path.join(__dirname, 'node_modules');
    
    // Function to get valid subfolders for a package
    function getValidSubfolders(packagePath) {
      const validSubfolders = [];
      subfolders.forEach(subfolder => {
        const fullPath = path.join(packagePath, subfolder);
        if (fs.existsSync(fullPath) && fs.lstatSync(fullPath).isDirectory()) {
          validSubfolders.push(subfolder);
        }
      });
      return validSubfolders;
    }
  
    // Iterate through each specified package
    packages.forEach(pkg => {
      const packagePath = path.join(modulePath, pkg);
      
      // Check if the package exists
      if (!fs.existsSync(packagePath)) {
        console.warn(`Package ${pkg} does not exist in node_modules`);
        return;
      }
      
      // Get valid subfolders for this package
      const validSubfolders = getValidSubfolders(packagePath);

      if (validSubfolders.length === 0) {
        console.warn(`Package ${pkg} does not contain the specified subfolders`);
        return;
      }

      // Copy JavaScript files from valid subfolders
      validSubfolders.forEach(subfolder => {
        const fullPath = path.join(packagePath, subfolder);
        
        // Filter for .js files
        fs.readdirSync(fullPath).forEach(file => {
          if (path.extname(file).toLowerCase() === '.js') {
            const filePath = path.join(fullPath, file);
            
            try {
              fs.accessSync(filePath, fs.constants.F_OK);
              
              const destFilePath = path.join(__dirname,destinationPath, pkg, subfolder, file);
              
              // Create parent directories if they don't exist
              const dirPath = path.dirname(destFilePath);
              if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
              }
              
              fs.copyFileSync(filePath, destFilePath);
              console.log(`Copied ${file} from ${pkg}/${subfolder} to ${destinationPath}`);
            } catch (err) {
              if (err.code === 'ENOENT') {
                console.warn(`File ${filePath} does not exist. Skipping.`);
              } else {
                console.error(`Error accessing ${filePath}: ${err.message}`);
              }
            }
          }
        });
      });
    });
}

const packages = ['github-pages-router'];
const subfolders = ['dist'];
const destinationPath = 'core';

copyPackageSubfolderJsFiles(packages, subfolders, destinationPath);
