import { Queue } from 'bullmq';

const execQueue = new Queue('ExecQueue', {
  connection: {
    host: '127.0.0.1',
    port: 6379,
  },
});

export default execQueue;
