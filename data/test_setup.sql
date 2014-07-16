# feed this file into mysql
# > sudo mysql < test_setup.sql
drop database if exists zoon_test;
create database zoon_test;
grant all privileges on zoon_test . * to 'test' @'localhost';
flush privileges;
set password for 'test'@'localhost' = password('test');
# then set user colleen's password as follows:
# > sudo mysql
# substituting actual password for XXXXX, in mysql type:

# quit to shell and then run the following. you will be prompted for pw
# > mysql -u test -p zoon_test < data/test_tables.sql
# > mysql -u test -p zoon_test < data/test_data.sql