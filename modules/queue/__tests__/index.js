'use strict';

import Queue from '../../queue';

describe('modules/queue', () => {

  let id, queue;

  beforeEach(() => {
    id = 'just_id';
    queue = new Queue();
  });

  describe('#dispatch', () => {

    it('should add a task to queue and execute it', function (done) {
      const task = () => Promise.resolve();

      queue
        .dispatch(id, task)
        .then(() => done())
        .catch(done);
    });

    it('should not run a task if previous tasks is not finished', function (done) {
      const order = [];

      const longTask = () => {
        order.push('start long task');

        return new Promise(resolve => {
          setTimeout(() => {
            order.push('finish long task');
            resolve();
          }, 10);
        });
      };

      const shortTask = () => {
        order.push('run short task');

        return Promise.resolve();
      };

      order.push('enqueue long task');
      queue.dispatch(id, longTask);

      order.push('enqueue short task');
      queue
        .dispatch(id, shortTask)
        .then(() => {
          assert.deepEqual(order, [
            'enqueue long task',
            'start long task',
            'enqueue short task',
            'finish long task',
            'run short task'
          ]);

          done();
        })
        .catch(done);
    });

    it('should run a task even if previous tasks will be rejected', function (done) {
      const longTask = () => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            reject();
          }, 10);
        });
      };

      let taskExecuted = false;
      const shortTask = () => {
        taskExecuted = true;
        return Promise.resolve();
      };

      queue.dispatch(id, longTask);

      queue
        .dispatch(id, shortTask)
        .then(() => {
          assert(taskExecuted);
          done();
        })
        .catch(done);
    });

  });

});
