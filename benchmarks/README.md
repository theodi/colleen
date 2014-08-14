#Colleen Jmeter Benchmarking
##Setup
Install jmeter from [apache](http://jmeter.apache.org/download_jmeter.cgi) or `brew install jmeter`, and the Standard and Extras plugin sets from the [jmeter plugins project](http://jmeter-plugins.org/). With a homebrew install, put the plugins jar files in `/usr/local/Cellar/jmeter/<version>/libexec/lib/ext`.

Configure jmeter using [this guide](http://www.ubik-ingenierie.com/blog/automatically-generating-nice-graphs-at-end-of-your-load-test-with-apache-jmeter-and-jmeter-plugins/)

Add these properties to the jmeter `user.properties` file, which is in `/usr/local/Cellar/jmeter/<version>/libexec/bin/user.properties` when using homebrew:

```
jmeter.save.saveservice.output_format=csv
jmeter.save.saveservice.data_type=false
jmeter.save.saveservice.label=true
jmeter.save.saveservice.response_code=true
jmeter.save.saveservice.response_data.on_error=false
jmeter.save.saveservice.response_message=false
jmeter.save.saveservice.successful=true
jmeter.save.saveservice.thread_name=true
jmeter.save.saveservice.time=true
jmeter.save.saveservice.subresults=false
jmeter.save.saveservice.assertions=false
jmeter.save.saveservice.latency=true
jmeter.save.saveservice.bytes=true
jmeter.save.saveservice.hostname=true
jmeter.save.saveservice.thread_counts=true
jmeter.save.saveservice.sample_count=true
jmeter.save.saveservice.response_message=false
jmeter.save.saveservice.assertion_results_failure_message=false
jmeter.save.saveservice.timestamp_format=HH:mm:ss
jmeter.save.saveservice.default_delimiter=,
jmeter.save.saveservice.print_field_names=true
jmeter.save.saveservice.autoflush=true
```

You can edit .jmx files interactively in jmeter, but the GUI limits benchmark performance, so use the GUI for testing and debugging, but do real benchmark runs from the cli.

##Application benchmarking
The jmeter file `colleen_local_cli.jmx` contains thread groups simulating browser, admin and monitoring requests that runs against a local instance running on port 5000.

There is a bash script called `run-bench.sh` in this folder that allocates more memory, runs jmeter in cli mode, and generates graphs after the run is complete in the `results` folder.

##Database benchmarking
As well as web tests, jmeter can also run tests aginst database servers directly. For mysql you will need to download and install the [MySQL JDBC driver](http://dev.mysql.com/downloads/connector/j/) jar file in `/usr/local/Cellar/jmeter/<version>/libexec/lib`.

Add a "JDBC Connection Configuration" object and set these connection params:

* Database URL: jdbc:mysql://localhost:3306/zoon
* JDBC driver class: com.mysql.jdbc.Driver
* Username: colleen
* Password: XXXXX

You must also set the variable name - this is used to distinguish between multiple JDBC connections, but you need to set it even if you only have one.

The `colleen_local_db.jmx` file contains a selection of MySQL queries to run directly against the database. Do not run the database benchmark at the same time as the node app.
