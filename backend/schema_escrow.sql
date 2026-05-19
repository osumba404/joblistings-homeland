-- Homeland — Escrow Schema
-- Run this in phpMyAdmin AFTER schema_jobs.sql

USE homeland;

-- Add escrow tracking columns to contracts
ALTER TABLE contracts
  ADD COLUMN status        ENUM('pending','funded','delivered','released','disputed') NOT NULL DEFAULT 'pending' AFTER agreed_budget,
  ADD COLUMN mpesa_receipt VARCHAR(20)  NULL AFTER status,
  ADD COLUMN funded_at     DATETIME     NULL AFTER mpesa_receipt,
  ADD COLUMN delivered_at  DATETIME     NULL AFTER funded_at,
  ADD COLUMN released_at   DATETIME     NULL AFTER delivered_at;

-- Records each financial transaction (payout + platform fee)
CREATE TABLE IF NOT EXISTS payments (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  contract_id  INT UNSIGNED        NOT NULL,
  recipient_id INT UNSIGNED        NOT NULL,
  amount       DECIMAL(12,2)       NOT NULL,
  type         ENUM('freelancer_payout','platform_fee') NOT NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contract_id)  REFERENCES contracts(id) ON DELETE CASCADE,
  FOREIGN KEY (recipient_id) REFERENCES users(id)     ON DELETE CASCADE
);
