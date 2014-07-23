# feed this file into mysql
# > sudo mysql < test_setup.sql
drop database if exists zoon_test;
create database zoon_test;
#create user 'test'@'localhost';
grant all privileges on zoon_test . * to 'test' @'localhost';
flush privileges;
set password for 'test'@'localhost' = password('test');