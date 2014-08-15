#!/usr/bin/env bash
mytmpdir=`mktemp -d 2>/dev/null || mktemp -d -t 'mytmpdir'`
echo "Saving temp data in $mytmpdir"
/usr/bin/env JVM_ARGS="-Xms2g -Xmx2g" jmeter -t ./colleen_local_cli.jmx -n -l "${mytmpdir}/jmeter-results.csv" -JTEST_RESULTS_FILE="${mytmpdir}/jmeter-results.csv"
rm -rf ${mytmpdir}
