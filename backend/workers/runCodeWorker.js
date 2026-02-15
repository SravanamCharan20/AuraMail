import { Worker } from 'bullmq';

const worker = new Worker(
  'ExecutorQueue',
  async (job) => {
    console.log('Processing Job ID:', job.id);
    console.log('Job Name:', job.name);
    console.log('Code:', job.data.code);
    console.log('Language:', job.data.language);

    await new Promise((resolve) => setTimeout(resolve, 10000));

    console.log('Job completed:', job.id);
    return { output: 'Execution successful' };
  },

  {
    connection: {
      host: '127.0.0.1',
      port: 6379,
    },
  }
);

worker.on("completed", (job, result) => {
    console.log(`Job ${job.id} finished with result:`, result);
  });
  
  worker.on("failed", (job, err) => {
    console.error(`Job ${job?.id} failed:`, err);
  });
  
  console.log("Worker is running...");