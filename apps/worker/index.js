const { Worker } = require('bullmq');
const Redis = require('ioredis');

// Connect to Redis (Docker compose hostname is 'redis')
const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

console.log('Worker is starting...');

// A simple worker for a 'notifications' queue
const notificationWorker = new Worker('notifications', async (job) => {
  console.log(`Processing job ${job.id} of type ${job.name}`);
  console.log('Job data:', job.data);
  
  // Here we will eventually add logic to send WhatsApp messages, etc.
  
  return 'Done';
}, { connection });

notificationWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completed!`);
});

notificationWorker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed with error ${err.message}`);
});

console.log('Worker is ready and listening to queues.');
