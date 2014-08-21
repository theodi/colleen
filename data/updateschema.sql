ALTER TABLE `classifications`
ENGINE = InnoDB,
CHANGE `created_at` `created_at` TIMESTAMP NOT NULL,
CHANGE `user_id` `user_id` INT(11) UNSIGNED NULL DEFAULT NULL,
CHANGE `project` `project` VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
CHANGE `country` `country` CHAR(2) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
CHANGE `region` `region` CHAR(2) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
CHANGE `city` `city` VARCHAR(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
CHANGE `latitude` `latitude` DECIMAL(9, 6) NULL DEFAULT NULL,
CHANGE `longitude` `longitude` DECIMAL(9, 6) NULL DEFAULT NULL,
ADD INDEX (`created_at`),
ADD INDEX (`project`);

ALTER TABLE `timeseries`
ENGINE = InnoDB,
CHANGE `type_id` `type_id` CHAR(1) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
CHANGE `project` `project` VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT '',
CHANGE `datetime` `datetime` TIMESTAMP NOT NULL,
CHANGE `updated` `updated` TIMESTAMP NOT NULL,
ADD INDEX `datetime` (`datetime`) COMMENT '',
ADD INDEX `updated` (`updated`, `type_id`, `interval`) COMMENT '';

ALTER TABLE `analytics`
ENGINE = InnoDB,
CHANGE `type_id` `type_id` CHAR(1) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
CHANGE `interval` `interval` CHAR(1) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
CHANGE `country` `country` CHAR(2) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
CHANGE `updated` `updated` TIMESTAMP NULL DEFAULT NULL;

ALTER TABLE `projects`
ENGINE = InnoDB,
CHANGE `id` `id` VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT '',
CHANGE `updated` `updated` TIMESTAMP NULL DEFAULT NULL;

ALTER TABLE `gaps`
ENGINE = InnoDB,
CHANGE `gap_begin` `gap_begin` TIMESTAMP NULL DEFAULT NULL,
CHANGE `gap_end` `gap_end` TIMESTAMP NULL DEFAULT NULL,
CHANGE `gap_size` `gap_size` INT(11) UNSIGNED NOT NULL,
CHANGE `gap_threshold` `gap_threshold` INT(11) UNSIGNED NOT NULL;
