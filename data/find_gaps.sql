DROP TABLE if EXISTS `gaps`;

CREATE TABLE `gaps` (
  `gap_size` int(11) NOT NULL,
  `gap_threshold` int(11) NOT NULL,
  `gap_begin` datetime NOT NULL,
  `gap_end` datetime NOT NULL
);

DROP PROCEDURE if EXISTS `findgaps`;

DELIMITER $$
CREATE PROCEDURE `findgaps`
( 
IN gap_threshold INT(11)
)
    BEGIN    
    DECLARE done INT DEFAULT FALSE;
    DECLARE a,b DATETIME;
    DECLARE gap_size INT;
    DECLARE cur CURSOR FOR SELECT created_at FROM classifications
                           ORDER BY created_at ASC;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;     
    OPEN cur;       
    FETCH cur INTO a;       
    read_loop: LOOP
        SET b = a;
        FETCH cur INTO a;   
        IF done THEN
            LEAVE read_loop;
        END IF;     
	SET gap_size = TIMESTAMPDIFF(SECOND,b,a);
        IF  gap_size > gap_threshold THEN
            INSERT INTO gaps (gap_begin, gap_end, gap_threshold, gap_size)
            VALUES (b,a, gap_threshold, gap_size);
        END IF;
    END LOOP;           
    CLOSE cur;      
    END$$

DELIMITER ;
