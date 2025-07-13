# BookingShowWebApp
Technology Used:
Frontend: Html,CSS and Js
Backend: NodeJs and python serverless (Using AWS lambda)
Database: AWS Dynamodb for user signup & AWS RDS Mysql for storing workshop and booking related data

Configuration:
NodeJs version 22+, Python 3.10/3.11
Mysql -> DBname-mydb, User-admin , Password-Admin_123
Dynamodb -> Table Name-Userdata-> partition key-username

Add layer for running lambda functions-> Lib-pymysql,bcrypt and jsonwebtoken
Add some data in mysql database from mysql client.


