# BookingShowWebApp
Technology Used->
*Frontend: Html,CSS and Js
*Backend: NodeJs and python serverless (Using AWS lambda)
*Database: AWS Dynamodb for user signup & AWS RDS Mysql for storing workshop and booking related data

Configuration:
*NodeJs version 22+, Python 3.10/3.11
*Mysql -> DBname-mydb, User-admin , Password-Admin_123
*Dynamodb -> Table Name-Userdata-> partition key-username

1)Add layer by upload zip files for running lambda functions-> Lib-pymysql,bcrypt and jsonwebtoken.
2)Add some data in mysql database from mysql client by running below queries.

CREATE TABLE City (
  city_id INT PRIMARY KEY AUTO_INCREMENT,
  city_name VARCHAR(100) NOT NULL
);

CREATE TABLE Slot (
  slot_id INT PRIMARY KEY AUTO_INCREMENT,
  city_id INT NOT NULL,
  slot_name VARCHAR(100),
  available_seats INT DEFAULT 80,
  FOREIGN KEY (city_id) REFERENCES City(city_id) ON DELETE CASCADE
);

CREATE TABLE Booking (
  booking_id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(100) NOT NULL,
  slot_id INT NOT NULL,
  booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (slot_id) REFERENCES Slot(slot_id) ON DELETE CASCADE
);

INSERT INTO City (city_name)
VALUES 
  ('Bangalore'),
  ('Mumbai'),
  ('Pune'),
  ('Delhi');
  
-- Bangalore (city_id = 1)
INSERT INTO Slot (city_id, slot_name, available_seats) VALUES
(1, 'Chaiyya Chaiyya', 80),
(1, 'London Thumakda', 80),
(1, 'Desi Girl', 80),
(1, 'Kar Gayi Chull', 80);

-- Mumbai (city_id = 2)
INSERT INTO Slot (city_id, slot_name, available_seats) VALUES
(2, 'Kala Chashma', 80),
(2, 'Badtameez Dil', 80),
(2, 'Mauja Hi Mauja', 80),
(2, 'Abhi Toh Party Shuru Hui Hai', 80);

-- Pune (city_id = 3)
INSERT INTO Slot (city_id, slot_name, available_seats) VALUES
(3, 'Gallan Goodiyan', 80),
(3, 'Baby Doll', 80),
(3, 'Bom Diggy Diggy', 80),
(3, 'Tamma Tamma Again', 80);

-- Delhi (city_id = 4)
INSERT INTO Slot (city_id, slot_name, available_seats) VALUES
(4, 'Char Baj Gaye', 80),
(4, 'Party All Night', 80),
(4, 'Hookah Bar', 80),
(4, 'You Are My Soniya', 80);


