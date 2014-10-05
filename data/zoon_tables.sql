--
-- Database: `zoon`
--

--
-- Table structure for table `analytics`
--
DROP TABLE IF EXISTS `analytics`;
CREATE TABLE `analytics` (
  `type_id`  CHAR(1)          NOT NULL DEFAULT '',
  `project`  VARCHAR(255)     NOT NULL,
  `interval` CHAR(1)          NOT NULL,
  `country`  CHAR(2)                   DEFAULT NULL,
  `count`    INT(10) UNSIGNED NOT NULL DEFAULT '0',
  `updated`  TIMESTAMP        NULL     DEFAULT NULL
)
  ENGINE =InnoDB
  DEFAULT CHARSET =utf8;

--
-- Table structure for table `classifications`
--
DROP TABLE IF EXISTS `classifications`;
CREATE TABLE `classifications` (
  `id`         INT(11) UNSIGNED  NOT NULL,
  `created_at` TIMESTAMP         NOT NULL,
  `user_id`    INT(11) UNSIGNED DEFAULT NULL,
  `project`    VARCHAR(32)
               CHARACTER SET ascii
               COLLATE ascii_bin NOT NULL,
  `country`    CHAR(2)          DEFAULT NULL,
  `region`     CHAR(2)          DEFAULT NULL,
  `city`       VARCHAR(255)     DEFAULT NULL,
  `latitude`   DECIMAL(9, 6)    DEFAULT NULL,
  `longitude`  DECIMAL(9, 6)    DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `created_at` (`created_at`),
  KEY `project` (`project`)
)
  ENGINE =InnoDB
  DEFAULT CHARSET =utf8;

--
-- Table structure for table `gaps`
--

DROP TABLE IF EXISTS `gaps`;
CREATE TABLE `gaps` (
  `gap_size`      INT(11)   NOT NULL,
  `gap_threshold` INT(11)   NOT NULL,
  `gap_begin`     TIMESTAMP NOT NULL,
  `gap_end`       TIMESTAMP NOT NULL
)
  ENGINE =InnoDB
  DEFAULT CHARSET =utf8;

--
-- Table structure for table `timeseries`
--

DROP TABLE IF EXISTS `timeseries`;
CREATE TABLE `timeseries` (
  `type_id`  CHAR(1)           NOT NULL DEFAULT '',
  `project`  VARCHAR(32)
             CHARACTER SET ascii
             COLLATE ascii_bin NOT NULL DEFAULT '',
  `interval` INT(10) UNSIGNED  NOT NULL,
  `datetime` TIMESTAMP         NOT NULL,
  `count`    INT(10) UNSIGNED  NOT NULL,
  `updated`  TIMESTAMP         NOT NULL,
  KEY `datetime` (`datetime`),
  KEY `updated` (`updated`, `type_id`, `interval`)
)
  ENGINE =InnoDB
  DEFAULT CHARSET =utf8;

--
-- Table structure for table `projects`
--

DROP TABLE IF EXISTS `projects`;
CREATE TABLE `projects` (
  `id`           VARCHAR(32)
                 CHARACTER SET ascii
                 COLLATE ascii_bin NOT NULL DEFAULT '',
  `name`         VARCHAR(255)      NOT NULL DEFAULT '',
  `display_name` VARCHAR(255)      NOT NULL DEFAULT '',
  `updated`      DATETIME                   DEFAULT NULL,
  PRIMARY KEY (`id`)
)
  ENGINE =InnoDB
  DEFAULT CHARSET =utf8;
