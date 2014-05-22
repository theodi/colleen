# Project Colleen


Data art project for the Data as Culture art programme.

This work is currently in active development. The most visible aspect will be a web-base animation built in javascript.

It is fed by an API built using Node.js, MySQL and Python.

##License

We intend for this work to be open source but have not yet chosen the license.

##Acknowledgements


Many have helped us. We will name them in time.

##Requirements

* Node.js
* npm
* mysql
* python
* various Javascript libraries
* other stuff to be added later

##Installation 

###dev on Mac
1. clone project from github

1. install MySQL Community Server (download from http://dev.mysql.com/downloads/mysql/) if not already on your machine.

1. run MySQL server:

        $ sudo /usr/local/mysql/support-files/mysql.server start

you will be prompted for a password. it wants the admin password for your mac.

1. create the database and load test data by following directions in data/setup.sql

1. install heroku toolbelt for mac from https://toolbelt.heroku.com/

1. install Node.js for mac from http://nodejs.org/download/

1. from the root directory of the project install node dependencies by running

        $ npm install

1. install supervisor.js globally (this will enable you to restart node.js server app automatically when the code changes):

        $ sudo npm install supervisor -g

1. set up environment variables by chucking the following into a file called dev.env (*.env files are in the git.ignore file for security reasons) in the project root:

        export WEB='supervisor server.js'
        export WNU_DB_URL=mysql://colleen:PUTMYSQLPASSWORDHERE@localhost/zoon
        export WNU_HOST=localhost:5000
        export WNU_DATA_MODE=archive       

the password here needs to be the same one you used when following the instructions in data/setup.sql

1. type 

        $ source dev.env

1. fire it up:

   	$ foreman start

1. visit app in browser at http://localhost:5000/chart.html

###production on heroku
1. create an account at heroku.com
1. in a terminal window from the project root directory run

        $ heroku login
	$ heroku create

should see something like

        Creating sharp-rain-871... done, stack is cedar
        http://sharp-rain-871.herokuapp.com/ | git@heroku.com:sharp-rain-871.git
        Git remote heroku added			

but it will be a different url of the form <word1>-<word2>-<number>.herokuapp.com which we'll refer to as YOURAPPNAME from here

1. if you do not want to use an existing database then provision a cleardb addon for your heroku app http://dashboard.heroku.com/apps/YOURAPPNAME, you will be given a db connection string to use which contains a user, password, dbhost and dbname. If you are a Team Colleen member you can use the one in the Technical Resources document on Google Drive. You can then load the test data from data/test_data.sql much as you did for your dev instance, but use the connection string provided.

1. run 

        $ heroku config:set WEB='node server.js'
        $ heroku config:set WNU_DATA_MODE=archive
        $ heroku config:set WNU_HOST=sharp-rain-871.herokuapp.com 
        $ heroku config:set WNU_DB_URL=mysql://<user>:<password>@<dbhost>/<dbname>?reconnect=true
	$ git push heroku master

1. visit your app at http://YOURAPPNAME


##TODO
* choose license
* thank people
* review list of requirements and add/delete as appropriate
* keep building