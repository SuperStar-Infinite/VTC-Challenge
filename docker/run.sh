#!/bin/sh
set -e

timestamp()
{
 date +"%Y-%m-%d %T"
}

runConsoleSymfonyCommand () {
    echo "$(timestamp):[run] php bin/console $1"
    output=`php bin/console $1`
    echo "$(timestamp):[run] Output command 'php bin/console $1' ${output}"
    exitcode=$?
    if [ "$exitcode" != "0" ];
    then
        exit 1;
    fi
}

if [[ -z "$DEBUG" ]]
then
    echo "$(timestamp):[run] Debug disabled"
    [ -f /etc/php7/conf.d/xdebug.ini ] && mv /etc/php7/conf.d/xdebug.ini /etc/php7/conf.d/xdebug.off
else
    echo "$(timestamp):[run] Debug enabled"
    [ -f /etc/php7/conf.d/xdebug.off ] && mv /etc/php7/conf.d/xdebug.off /etc/php7/conf.d/xdebug.ini
fi

# Only run cache:clear if vendor directory exists (dependencies installed)
if [ -d "vendor" ]; then
    runConsoleSymfonyCommand "cache:clear"
else
    echo "$(timestamp):[run] Vendor directory not found, skipping cache:clear. Run 'composer install' first."
fi

echo "$(timestamp):[run] Running supervisord";
/usr/bin/supervisord -c ./docker/config/supervisord.conf
