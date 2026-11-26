USE eos;
-- Run ONCE on an existing database that never ran the earlier version of this file.
-- Stores the onboarding answers (gender, goals, experience, days/week, age, height, weight).
ALTER TABLE users
  ADD COLUMN gender ENUM('male','female') NULL AFTER phone,
  ADD COLUMN age TINYINT UNSIGNED NULL AFTER gender,
  ADD COLUMN height_cm SMALLINT UNSIGNED NULL AFTER age,
  ADD COLUMN weight_kg DECIMAL(5,1) NULL AFTER height_cm,
  ADD COLUMN goals VARCHAR(255) NULL AFTER weight_kg,
  ADD COLUMN experience VARCHAR(40) NULL AFTER goals,
  ADD COLUMN days_per_week TINYINT UNSIGNED NULL AFTER experience,
  DROP COLUMN phone_verified_at;
DROP TABLE IF EXISTS otp_codes;
CREATE TABLE IF NOT EXISTS announcements (
  id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(150) NOT NULL, description TEXT,
  image_url MEDIUMTEXT, link VARCHAR(500), created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
ALTER TABLE posters MODIFY image_url MEDIUMTEXT;
