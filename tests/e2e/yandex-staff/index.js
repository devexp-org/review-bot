import { merge } from '../app';
import secret from '../../../config/secret';

export function withYandexStaff(next) {

  return function (test, config, done) {

    config = merge(config, {
      services: {
        'yandex-staff': {
          path: './src/plugins/yandex-staff',
          options: {
            center_url: 'https://center.yandex-team.ru/api/v1/',
            jabber_url: 'https://center.yandex-team.ru/jabber/status-bulk/'
          }

        }
      }
    });

    config.services.github = merge(
      config.services['yandex-staff'],
      secret.services['yandex-staff']
    );

    next(test, config, done);
  };

}
