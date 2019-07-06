import 'dotenv/config';
import Queue from './lib/Queue';

Queue.processQueue();
// pq fazer isso? pq nao executa a aplicacao no mesmo node, execucao que vai rodar a fila
