-- Homeland Job Listings — Auth Schema
-- Run this in phpMyAdmin (XAMPP) before starting the server

CREATE DATABASE IF NOT EXISTS homeland;
USE homeland;

CREATE TABLE IF NOT EXISTS users (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100)                   NOT NULL,
  email       VARCHAR(255)                   NOT NULL UNIQUE,
  phone       VARCHAR(20)                    NOT NULL,
  password    VARCHAR(255)                   NOT NULL,
  role        ENUM('freelancer','employer')  NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED  NOT NULL,
  token       VARCHAR(512)  NOT NULL UNIQUE,
  expires_at  DATETIME      NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
