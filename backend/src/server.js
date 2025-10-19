require('module-alias/register');
const mongoose = require('mongoose');
const { globSync } = require('glob');
const path = require('path');

// Make sure we are running node 7.6+
const [major, minor] = process.versions.node.split('.').map(parseFloat);
if (major < 20) {
  console.log('🚫 Please upgrade your node.js version to at least 20 or greater. 👌\n ');
  process.exit(1);
}

// Import environmental variables from our variables.env file
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

// Environment validation
function validateEnvironment() {
  const requiredEnvVars = ['DATABASE', 'JWT_SECRET'];
  const missing = requiredEnvVars.filter((envVar) => !process.env[envVar]);

  if (missing.length > 0) {
    console.error('🚫 Missing required environment variables:');
    missing.forEach((envVar) => console.error(`   - ${envVar}`));
    console.error('\n💡 Please check your .env file and ensure all required variables are set.');
    console.error('📝 See .env.example for reference.\n');
    process.exit(1);
  }
}

// Validate environment before proceeding
validateEnvironment();

console.log(`🚀 Starting IDURAR ERP CRM Backend...`);
console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🔌 Port: ${process.env.PORT || 8888}`);

// MongoDB connection options for production stability
const mongooseOptions = {
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
  family: 4, // Use IPv4, skip trying IPv6
  maxPoolSize: 10, // Maintain up to 10 socket connections
  minPoolSize: 2, // Maintain at least 2 socket connections
  maxIdleTimeMS: 10000, // Close idle connections after 10s
};

mongoose.connect(process.env.DATABASE, mongooseOptions);

mongoose.connection.on('error', (error) => {
  console.error('🚫 MongoDB Connection Error:');
  console.error(`   ${error.message}`);
  console.error('\n💡 Common solutions:');
  console.error('   - Check if MongoDB is running');
  console.error('   - Verify DATABASE URL in .env file');
  console.error('   - Ensure database credentials are correct\n');
});

mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB connected successfully');
  console.log(`🔗 Database: ${process.env.DATABASE.split('@')[1] || process.env.DATABASE}`);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected successfully');
});

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const modelsFiles = globSync('./src/models/**/*.js');

for (const filePath of modelsFiles) {
  require(path.resolve(filePath));
}

// Start our app!
const app = require('./app');
app.set('port', process.env.PORT || 8888);
const server = app.listen(app.get('port'), () => {
  console.log(`🚀 IDURAR ERP CRM Backend is running!`);
  console.log(`📡 Server URL: http://localhost:${server.address().port}`);
  console.log(`🔗 API Base: http://localhost:${server.address().port}/api`);
  console.log(
    `📁 File Server: ${
      process.env.PUBLIC_SERVER_FILE || `http://localhost:${server.address().port}/`
    }`
  );
  if (process.env.NODE_ENV === 'development') {
    console.log(`\n🛠️  Development mode active`);
    console.log(`💡 API Documentation available at: http://localhost:${server.address().port}/api`);
  }
  console.log(`\n✅ Ready to accept requests!\n`);
});
