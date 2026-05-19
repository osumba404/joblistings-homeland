-- Homeland — Jobs, Proposals, Contracts Schema
-- Run this in phpMyAdmin AFTER schema.sql

USE homeland;

CREATE TABLE IF NOT EXISTS jobs (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  employer_id  INT UNSIGNED   NOT NULL,
  title        VARCHAR(255)   NOT NULL,
  description  TEXT           NOT NULL,
  category     VARCHAR(100)   NOT NULL,
  location     VARCHAR(100)   NOT NULL,
  budget       DECIMAL(12,2)  NOT NULL,
  skills       JSON           NOT NULL,
  deadline     DATE           NOT NULL,
  status       ENUM('open','closed') DEFAULT 'open',
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employer_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS proposals (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  job_id           INT UNSIGNED   NOT NULL,
  freelancer_id    INT UNSIGNED   NOT NULL,
  cover_letter     TEXT           NOT NULL,
  proposed_budget  DECIMAL(12,2)  NOT NULL,
  timeline_days    INT UNSIGNED   NOT NULL,
  status           ENUM('pending','accepted','rejected') DEFAULT 'pending',
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id)        REFERENCES jobs(id)  ON DELETE CASCADE,
  FOREIGN KEY (freelancer_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY one_proposal_per_job (job_id, freelancer_id)
);

CREATE TABLE IF NOT EXISTS contracts (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  job_id         INT UNSIGNED   NOT NULL,
  proposal_id    INT UNSIGNED   NOT NULL UNIQUE,
  employer_id    INT UNSIGNED   NOT NULL,
  freelancer_id  INT UNSIGNED   NOT NULL,
  agreed_budget  DECIMAL(12,2)  NOT NULL,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id)        REFERENCES jobs(id)       ON DELETE CASCADE,
  FOREIGN KEY (proposal_id)   REFERENCES proposals(id)  ON DELETE CASCADE,
  FOREIGN KEY (employer_id)   REFERENCES users(id)      ON DELETE CASCADE,
  FOREIGN KEY (freelancer_id) REFERENCES users(id)      ON DELETE CASCADE
);
