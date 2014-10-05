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

INSERT INTO `projects` (`id`, `name`, `display_name`, `updated`)
VALUES
  ('507edef23ae74020d6000001', 'andromeda', 'Andromeda Project', NULL),
  ('4fff255d516bcb407b000001', 'bat_detective', 'Bat Detective', NULL),
  ('5040d826a7823f1d95000001', 'cancer_cells', 'Cell Slider', NULL),
  ('52e2cba83ae7401db5000001', 'condor', 'Condor Watch', NULL),
  ('503293e6516bcb6782000001', 'cyclone_center', 'Cyclone Center', NULL),
  ('52e2cfc1806ea54590000001', 'wise', 'Disk Detective', NULL),
  ('502a90cd516bcb060c000001', 'galaxy_zoo', 'Galaxy Zoo', '2014-05-14 00:00:00'),
  ('502a701d516bcb0001000001', 'galaxy_zoo_quiz', 'Galaxy Zoo Quiz', NULL),
  ('51e6fcdd3ae74023b9000001', 'galaxy_zoo_starburst', 'Galaxy Zoo Starburst', NULL),
  ('5154abce3ae740898b000001', 'leaf', 'MicroPlants', NULL),
  ('511410da3ae740c3ec000001', 'notes_from_nature', 'Notes From Nature', NULL),
  ('50e9e3d33ae740f1f3000001', 'planet_four', 'Planet Four', NULL),
  ('516d6f243ae740bc96000001', 'plankton', 'Plankton Portal', NULL),
  ('523c78e23ae7403f53000001', 'cancer_gene_runner', 'Play to Cure: Genes in Space', NULL),
  ('52afdb804d69636532000001', 'radio', 'Radio Galaxy Zoo', NULL),
  ('4fdf8fb3c32dab6c95000001', 'sea_floor', 'Seafloor Explorer', NULL),
  ('5077375154558fabd7000001', 'serengeti', 'Snapshot Serengeti', NULL),
  ('5101a1341a320ea77f000001', 'spacewarp', 'Space Warps', NULL),
  ('52d1718e3ae7401cc8000001', 'm83', 'Star Date: M83', NULL),
  ('51c1c9523ae74071c0000001', 'sunspot', 'Sunspotter', NULL),
  ('523ca1a03ae74053b9000001', 'milky_way', 'The Milky Way Project', '2014-05-14 00:00:00'),
  ('52d065303ae740380a000001', 'war_diary', 'War Diaries', NULL),
  ('51c9bba83ae7407725000001', 'worms', 'Worm Watch Lab', NULL);
