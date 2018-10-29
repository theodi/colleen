# We Need Us


Data art project for the Data as Culture art programme.

This work is currently in active development. The most visible aspect will be a web-base animation built in javascript.

It is fed by an API built using Node.js and MySQL.

##License & Acknowledgements

See weneedus.org

##Requirements

* Node.js
* npm
* mysql
* various Javascript libraries

##Installation 

###dev on Mac
1. Clone project from github.

1. Install MySQL Community Server (download from http://dev.mysql.com/downloads/mysql/) if not already on your machine.

1. Run MySQL server. You will be prompted for a password. It wants the admin password for your mac:

        $ sudo /usr/local/mysql/support-files/mysql.server start


1. Create the database and load test data by following directions in data/setup.sql

1. Install heroku toolbelt for mac from https://toolbelt.heroku.com/

1. Install Node.js for mac from http://nodejs.org/download/

1. From the root directory of the project install node dependencies by running:

        $ npm install

1. Install supervisor.js globally (this will enable you to restart node.js server app automatically when the code changes):

        $ sudo npm install supervisor -g

1. Set up environment variables by chucking the following into a file called dev.env (*.env files are in the git.ignore file for security reasons) in the project root (the password here needs to be the same one you used when following the instructions in data/setup.sql):

        export WEB='supervisor server.js'
        export WNU_DB_URL=mysql://colleen:PUTMYSQLPASSWORDHERE@localhost/zoon
        export WNU_HOST=localhost:5000
        export NODE_ENV=dev

1. Type:

        $ source dev.env

1. Fire it up:

   	$ foreman start

1. Visit app in browser at http://localhost:5000/chart.html

1. For animation dev, run this in a separate console window to auto compile changes to the JSON and SVG files

        $ supervisor -n exit -w client/data/src -e json,svg client/util/compile_assets.js

1. Visit app in browser at http://localhost:5000/index.html

###production on heroku
1. Create an account at heroku.com
1. In a terminal window from the project root directory run the following two commands and you should a response like the one below (but it will be a different url of the form word1-word2-number.herokuapp.com which we'll refer to as YOURAPPNAME from here):

        $ heroku login
        $ heroku create
        
        Creating sharp-rain-871... done, stack is cedar
        http://sharp-rain-871.herokuapp.com/ | git@heroku.com:sharp-rain-871.git
        Git remote heroku added			

1. If you do not want to use an existing database then provision a cleardb addon for your heroku app http://dashboard.heroku.com/apps/YOURAPPNAME, you will be given a db connection string to use which contains a user, password, dbhost and dbname. If you are a Team Colleen member you can use the one in the Technical Resources document on Google Drive. You can initialise the tables by running

        $ mysql -u <username> -h <hostaddress> -p <dbname> < data/zoon_tables.sql

1. Run 

        $ heroku config:set WEB='node server.js'
        $ heroku config:set WNU_HOST=sharp-rain-871.herokuapp.com 
        $ heroku config:set WNU_DB_URL=mysql://<user>:<password>@<dbhost>/<dbname>?reconnect=true
        $ heroku config:set NODE_ENV=prod
        $ git push heroku master

1. Visit your app at http://YOURAPPNAME



