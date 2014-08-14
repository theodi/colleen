#!/usr/bin/env bash
/usr/bin/env JVM_ARGS="-Xms2g -Xmx2g" jmeter -t ./colleen_local_cli.jmx -n -l /tmp/jmeter-results.csv -JTEST_RESULTS_FILE=/tmp/jmeter-results.csv
