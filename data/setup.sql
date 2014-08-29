# feed this file into mysql
# > sudo mysql < setup.sql
create database zoon;
grant all privileges on zoon . * to 'colleen'@'localhost';
flush privileges;
# then set user colleen's password as follows:
# > sudo mysql
# substituting actual password for XXXXX, in mysql type:
# set password for 'colleen'@'localhost' = password('XXXXX');
# quit to shell and then run the following. you will be prompted for pw
# > mysql -u colleen -p zoon < data/zoon_tables.sql