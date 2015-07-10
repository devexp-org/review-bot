#!/usr/bin/env bash

NODE_MODULES=node_modules

if [ ! -d $NODE_MODULES/app ]; then
    ln -s ../app $NODE_MODULES/app
fi

mkdir -p data 2> /dev/null
mkdir -p logs 2> /dev/null

NORMAL='\033[0m'
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
MAGENTA='\033[0;35m'
GRAY='\033[0;37m'

echo -en "
${GREEN}        /\_/\   ${GRAY}== -- == -- == -- ==
${GREEN}   ____/ o o \  ${MAGENTA}You are almost done!
${GREEN} /~____  =ø= /  ${GRAY}== -- == -- == -- ==
${GREEN}(______)__m_m)  ${NORMAL}

${RED}!IMPORTANT!${NORMAL} To complete setup please do following:

1) Go to ${YELLOW}app/config/github.js${NORMAL} and fill the ${YELLOW}'token'${NORMAL} field with ${YELLOW}github api access token${NORMAL}.
2) Go to ${YELLOW}app/config/github_org_team.js${NORMAL} and setup your repo -> github org team mapping or switch
   to simple team plugin by replacing github_team_org plugin in app/config/review.js
   to simple_team and don't forget to pass team to simple_team plugin,
   example config are here — app/config/team.js.

${GRAY}    ________. ${NORMAL}And if something went wrong — keep calm and forget about this repo.
${GRAY}  ~(_]------' ${NORMAL}-=-=- OR -=-=-
${GRAY} /_(          ${MAGENTA}You can commit an issue here: https://github.com/devexp-org/devexp/issues ${NORMAL}
"
