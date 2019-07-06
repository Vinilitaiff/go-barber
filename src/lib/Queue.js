import Bee from 'bee-queue';
import CancellationMail from '../app/jobs/CancellationMail';
import redisConfig from '../config/redis';

const jobs = [CancellationMail];

class Queue {
  constructor() {
    // cada tipo de background job vai ter sua fila
    this.queues = {};
    this.init();
  }

  init() {
    // desestruturando eu consigo pegar os metodos de dentro do jobs
    // pegando todos os jobs e armazenando nos queues
    jobs.forEach(({ key, handle }) => {
      this.queues[key] = {
        bee: new Bee(key, {
          redis: redisConfig,
        }),
        handle,
      };
    });
  }

  // toda vez que criar um job
  add(queue, job) {
    return this.queues[queue].bee.createJob(job).save();
  }

  // o process executa em background
  processQueue() {
    jobs.forEach(job => {
      const { bee, handle } = this.queues[job.key];

      bee.on('failed', this.handleFailure).process(handle);
    });
  }

  handleFailure(job, err) {
    console.log(`Queue ${job.queue.name}: FAILED`, err);
  }
}

export default new Queue();
