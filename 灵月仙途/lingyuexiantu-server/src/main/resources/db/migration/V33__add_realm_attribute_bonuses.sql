ALTER TABLE cfg_realm_attribute_mult ADD COLUMN vit_bonus INT DEFAULT 0;
ALTER TABLE cfg_realm_attribute_mult ADD COLUMN spi_bonus INT DEFAULT 0;
ALTER TABLE cfg_realm_attribute_mult ADD COLUMN agi_bonus INT DEFAULT 0;
ALTER TABLE cfg_realm_attribute_mult ADD COLUMN wis_bonus INT DEFAULT 0;
ALTER TABLE cfg_realm_attribute_mult ADD COLUMN lck_bonus INT DEFAULT 0;

UPDATE cfg_realm_attribute_mult SET vit_bonus = 0, spi_bonus = 0, agi_bonus = 0, wis_bonus = 0, lck_bonus = 0 WHERE realm_level = 0;
UPDATE cfg_realm_attribute_mult SET vit_bonus = 2, spi_bonus = 3, agi_bonus = 1, wis_bonus = 0, lck_bonus = 0 WHERE realm_level = 1;
UPDATE cfg_realm_attribute_mult SET vit_bonus = 4, spi_bonus = 6, agi_bonus = 2, wis_bonus = 1, lck_bonus = 0 WHERE realm_level = 2;
UPDATE cfg_realm_attribute_mult SET vit_bonus = 6, spi_bonus = 9, agi_bonus = 3, wis_bonus = 2, lck_bonus = 1 WHERE realm_level = 3;
UPDATE cfg_realm_attribute_mult SET vit_bonus = 10, spi_bonus = 15, agi_bonus = 5, wis_bonus = 3, lck_bonus = 1 WHERE realm_level = 4;
UPDATE cfg_realm_attribute_mult SET vit_bonus = 16, spi_bonus = 24, agi_bonus = 8, wis_bonus = 5, lck_bonus = 2 WHERE realm_level = 5;
UPDATE cfg_realm_attribute_mult SET vit_bonus = 24, spi_bonus = 36, agi_bonus = 12, wis_bonus = 8, lck_bonus = 3 WHERE realm_level = 6;
UPDATE cfg_realm_attribute_mult SET vit_bonus = 36, spi_bonus = 54, agi_bonus = 18, wis_bonus = 12, lck_bonus = 4 WHERE realm_level = 7;
UPDATE cfg_realm_attribute_mult SET vit_bonus = 52, spi_bonus = 78, agi_bonus = 26, wis_bonus = 18, lck_bonus = 6 WHERE realm_level = 8;
UPDATE cfg_realm_attribute_mult SET vit_bonus = 72, spi_bonus = 108, agi_bonus = 36, wis_bonus = 26, lck_bonus = 8 WHERE realm_level = 9;
