-- 使用存储过程检查并添加avatar列
DELIMITER //
CREATE PROCEDURE add_avatar_column_if_not_exists()
BEGIN
    DECLARE column_exists INT DEFAULT 0;
    SELECT COUNT(*) INTO column_exists
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
    AND table_name = 'game_role'
    AND column_name = 'avatar';
    
    IF column_exists = 0 THEN
        ALTER TABLE game_role ADD COLUMN avatar VARCHAR(255) DEFAULT NULL;
    END IF;
END //
DELIMITER ;

CALL add_avatar_column_if_not_exists();
DROP PROCEDURE add_avatar_column_if_not_exists;