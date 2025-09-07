// test-setup.js - Basic setup validation script

const fs = require('fs');
const path = require('path');

console.log('🧪 Prompter AI Setup Validation\n');

// Check if all required directories exist
const requiredDirs = [
  'extension',
  'backend', 
  'web',
  'web/pages',
  'web/components',
  'web/lib',
  'web/styles'
];

console.log('📁 Checking directory structure...');
requiredDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`✅ ${dir}/`);
  } else {
    console.log(`❌ ${dir}/ - Missing`);
  }
});

// Check if all required files exist
const requiredFiles = [
  'extension/manifest.json',
  'extension/background.js',
  'extension/content.js',
  'extension/popup.html',
  'extension/popup.js',
  'extension/popup.css',
  'backend/server.js',
  'backend/package.json',
  'backend/supabase-schema.sql',
  'web/package.json',
  'web/next.config.js',
  'web/tailwind.config.js',
  'web/pages/_app.js',
  'web/pages/index.js',
  'web/pages/docs.js',
  'web/pages/dashboard.js',
  'web/lib/supabase.js',
  'web/styles/globals.css',
  'README.md',
  'DEPLOYMENT.md'
];

console.log('\n📄 Checking required files...');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - Missing`);
  }
});

// Check package.json files
console.log('\n📦 Checking package.json files...');
try {
  const backendPkg = JSON.parse(fs.readFileSync('backend/package.json', 'utf8'));
  const webPkg = JSON.parse(fs.readFileSync('web/package.json', 'utf8'));
  
  console.log('✅ backend/package.json - Valid');
  console.log('✅ web/package.json - Valid');
  
  // Check for required dependencies
  const backendDeps = Object.keys(backendPkg.dependencies || {});
  const webDeps = Object.keys(webPkg.dependencies || {});
  
  const requiredBackendDeps = ['express', 'cors', 'dotenv', '@supabase/supabase-js', 'stripe'];
  const requiredWebDeps = ['next', 'react', 'react-dom', '@supabase/supabase-js'];
  
  console.log('\n🔍 Checking backend dependencies...');
  requiredBackendDeps.forEach(dep => {
    if (backendDeps.includes(dep)) {
      console.log(`✅ ${dep}`);
    } else {
      console.log(`❌ ${dep} - Missing`);
    }
  });
  
  console.log('\n🔍 Checking web dependencies...');
  requiredWebDeps.forEach(dep => {
    if (webDeps.includes(dep)) {
      console.log(`✅ ${dep}`);
    } else {
      console.log(`❌ ${dep} - Missing`);
    }
  });
  
} catch (error) {
  console.log('❌ Error reading package.json files:', error.message);
}

// Check environment files
console.log('\n🔧 Checking environment configuration...');
const envFiles = [
  'backend/env.example',
  'web/env.example'
];

envFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - Missing`);
  }
});

// Check manifest.json
console.log('\n🔌 Checking Chrome extension manifest...');
try {
  const manifest = JSON.parse(fs.readFileSync('extension/manifest.json', 'utf8'));
  
  if (manifest.manifest_version === 3) {
    console.log('✅ Manifest V3');
  } else {
    console.log('❌ Not Manifest V3');
  }
  
  const requiredPermissions = ['activeTab', 'scripting', 'storage', 'tabs'];
  const hasAllPermissions = requiredPermissions.every(perm => 
    manifest.permissions && manifest.permissions.includes(perm)
  );
  
  if (hasAllPermissions) {
    console.log('✅ Required permissions present');
  } else {
    console.log('❌ Missing required permissions');
  }
  
} catch (error) {
  console.log('❌ Error reading manifest.json:', error.message);
}

console.log('\n🎉 Setup validation complete!');
console.log('\n📋 Next steps:');
console.log('1. Set up your Supabase project and run the SQL schema');
console.log('2. Configure environment variables in backend/.env and web/.env.local');
console.log('3. Install dependencies: cd backend && npm install && cd ../web && npm install');
console.log('4. Start the backend: cd backend && npm start');
console.log('5. Start the web app: cd web && npm run dev');
console.log('6. Load the Chrome extension in Developer mode');
console.log('\n🚀 Ready to launch Prompter AI!');
