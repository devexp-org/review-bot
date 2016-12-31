import { forEach } from 'lodash';
import { Router as router } from 'express';

export default function setup(options, imports) {

  const notification = imports.notification;

  const notificationRoute = router();

  notificationRoute.get('/transports', function (req, res) {
    const transports = [];

    forEach(notification.getTransports(), (_transport, name) => {
      transports.push(name);
    });

    res.json(transports);
  });

  return notificationRoute;

}
