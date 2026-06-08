-- 使用存储过程检查并添加sort列
DELIMITER //
CREATE PROCEDURE add_sort_column_if_not_exists()
BEGIN
    DECLARE column_exists INT DEFAULT 0;
    SELECT COUNT(*) INTO column_exists
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
    AND table_name = 'sys_role'
    AND column_name = 'sort';
    
    IF column_exists = 0 THEN
        ALTER TABLE sys_role ADD COLUMN sort INT DEFAULT 0;
    END IF;
END //
DELIMITER ;

CALL add_sort_column_if_not_exists();
DROP PROCEDURE add_sort_column_if_not_exists;;
