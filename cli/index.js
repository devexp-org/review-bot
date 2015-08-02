/* global process */
var program = require('commander'),
    path = require('path'),
    chalk = require('chalk'),
    sh = require('shelljs');

require('shelljs/global');

var config = require('./config');

program
    .version('0.0.1')
    .option('--debug', 'Turn debug mode on')
    .on('--help', function() {

    });

program
    .command('postinstall')
    .description('Run postinstall commands')
    .action(function() {

        var appSymlink = path.join(config.node_modules, 'app');
        if (!test('-L', appSymlink)) {
            ln('-s', 'app', appSymlink);
        }

        if (!test('-d', config.data)) {
            mkdir('-p', config.data);
        }

        if (!test('-d', config.logs)) {
            mkdir('-p', config.logs);
        }

        var cat = [
            '        /\\_/\\   ',
            '   ____/ o o \\  ',
            ' /~____  =ø= /  ',
            '(______)__m_m)  '
        ].map(function(line) {
            return chalk.green(line);
        });

        var message = [
            chalk.gray('== -- == -- == -- =='),
            chalk.magenta('You are almost done!'),
            chalk.gray('== -- == -- == -- =='),
            ''
        ];

        console.log();
        message.forEach(function(line, i) {
            console.log('%s %s', cat[i], line);
        });
        console.log();
        //echo -en "
        //    ${GREEN}        /\_/\   ${GRAY}== -- == -- == -- ==
        //    ${GREEN}   ____/ o o \  ${MAGENTA}You are almost done!
        //    ${GREEN} /~____  =ø= /  ${GRAY}== -- == -- == -- ==
        //    ${GREEN}(______)__m_m)  ${NORMAL}
        //
        //${RED}!IMPORTANT!${NORMAL} To complete setup please do following:
        //
        //    1) Go to ${YELLOW}app/config/github.js${NORMAL} and fill the ${YELLOW}'token'${NORMAL} field with ${YELLOW}github api access token${NORMAL}.
        //2) Go to ${YELLOW}app/config/github_org_team.js${NORMAL} and setup your repo -> github org team mapping or switch
        //    to simple team plugin by replacing github_team_org plugin in app/config/review.js
        //        to simple_team and don't forget to pass team to simple_team plugin,
        //        example config are here — app/config/team.js.
        //
        //            ${GRAY}    ________. ${NORMAL}And if something went wrong — keep calm and forget about this repo.
        //            ${GRAY}  ~(_]------' ${NORMAL}-=-=- OR -=-=-
        //            ${GRAY} /_(          ${MAGENTA}You can commit an issue here: https://github.com/devexp-org/devexp/issues ${NORMAL}
        //            "

    });

program.parse(process.argv);

if (!program.debug) {
    // используем по умолчанию "тихий" решим shell
    sh.config.silent = true;
}

if (!program.args.length) {
    program.help();
}
