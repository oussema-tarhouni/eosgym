USE eos;
-- ONLY if you already ran the previous 001 (the one with date_of_birth / fitness_goal / emergency_*).
ALTER TABLE users
  DROP COLUMN date_of_birth, DROP COLUMN fitness_goal, DROP COLUMN emergency_name, DROP COLUMN emergency_phone,
  ADD COLUMN age TINYINT UNSIGNED NULL AFTER gender,
  ADD COLUMN goals VARCHAR(255) NULL AFTER weight_kg,
  ADD COLUMN experience VARCHAR(40) NULL AFTER goals,
  ADD COLUMN days_per_week TINYINT UNSIGNED NULL AFTER experience;
