SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS studentdb CHARACTER SET utf8mb4;
USE studentdb;

CREATE TABLE IF NOT EXISTS students (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id VARCHAR(10),
  fullname VARCHAR(100),
  dob DATE,
  major VARCHAR(50)
);

INSERT INTO students (student_id, fullname, dob, major) VALUES
  ('SV001', 'Kim Xuyen',    '2005-12-16', 'Information Technology'),
  ('SV002', 'Nguyen Van A', '2005-03-10', 'Computer Science'),
  ('SV003', 'Tran Thi B',   '2005-07-25', 'Software Engineering');
