color_reset="\033[m"
color_command="\033[0;34m"
color_wait="\033[1;33m"

echo -e "${color_command}Clearing pull_requests table in ${color_reset}" &&
mongo devexp_test --eval "db.pull_requests.drop()" && echo "" &&

echo -e "${color_command}Adding pull request${color_reset}" &&
./webhook.sh tests/data/pull_request_webhook.json && echo ""
echo -e "${color_wait}wait${color_reset}" && echo "" &&
sleep 10 &&

echo -e "${color_command}[run]${color_reset} add" &&
./webhook.sh tests/data/issue_comment_webhook__add.json issue_comment && echo "" &&
echo -e "${color_wait}wait${color_reset}" && echo "" &&
sleep 3 &&

echo -e "${color_command}[run]${color_reset} remove" &&
./webhook.sh tests/data/issue_comment_webhook__remove.json issue_comment && echo "" &&
echo -e "${color_wait}wait${color_reset}" && echo "" &&
sleep 3 &&

echo -e "${color_command}[run]${color_reset} change" &&
./webhook.sh tests/data/issue_comment_webhook__change.json issue_comment && echo "" &&
echo -e "${color_wait}wait${color_reset}" && echo "" &&
sleep 3 &&

echo -e "${color_command}[run]${color_reset} start" &&
./webhook.sh tests/data/issue_comment_webhook__start.json issue_comment && echo "" &&
echo -e "${color_wait}wait${color_reset}" && echo "" &&
sleep 3 &&

echo -e "${color_command}[run]${color_reset} stop" &&
./webhook.sh tests/data/issue_comment_webhook__stop.json issue_comment && echo "" &&
echo -e "${color_wait}wait${color_reset}" && echo "" &&
sleep 3 &&

echo -e "${color_command}[run]${color_reset} start" &&
./webhook.sh tests/data/issue_comment_webhook__start.json issue_comment && echo "" &&
echo -e "${color_wait}wait${color_reset}" && echo "" &&
sleep 3 &&

echo -e "${color_command}[run]${color_reset} ok" &&
./webhook.sh tests/data/issue_comment_webhook__ok.json issue_comment && echo "" &&
echo -e "${color_wait}wait${color_reset}" && echo "" &&
sleep 3 &&

echo -e "${color_command}[run]${color_reset} not ok" &&
./webhook.sh tests/data/issue_comment_webhook__not-ok.json issue_comment && echo "" &&
echo -e "${color_wait}wait${color_reset}" && echo "" &&
sleep 3 &&

echo -e "${color_command}[run]${color_reset} busy" &&
./webhook.sh tests/data/issue_comment_webhook__busy.json issue_comment && echo "" &&
echo -e "${color_wait}wait${color_reset}" && echo "" &&
sleep 3 &&

echo -e "${color_command}[run]${color_reset} ping" &&
./webhook.sh tests/data/issue_comment_webhook__ping.json issue_comment && echo "" &&
echo -e "${color_wait}wait${color_reset}" && echo "" &&
sleep 3
