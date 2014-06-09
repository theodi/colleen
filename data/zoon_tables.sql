
--
-- Database: `zoon`
--

-- --------------------------------------------------------

--
-- Table structure for table `analytics`
--

CREATE TABLE IF NOT EXISTS `analytics` (
  `type_id` varchar(1) NOT NULL DEFAULT '',
  `project` varchar(255) NOT NULL,
  `interval` varchar(1) NOT NULL,
  `country` varchar(2) DEFAULT '',
  `count` int(10) unsigned NOT NULL DEFAULT '0',
  `updated` datetime DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `analytics`
--
CREATE TABLE IF NOT EXISTS `timeseries` (
  `type_id` varchar(1) NOT NULL DEFAULT '',
  `project` varchar(255) NOT NULL DEFAULT '',
  `interval` int(10) unsigned NOT NULL,
  `datetime` datetime NOT NULL,
  `count` int(10) unsigned NOT NULL,
  `updated` datetime NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `classifications`
--

CREATE TABLE IF NOT EXISTS `classifications` (
  `id` int(11) unsigned NOT NULL,
  `created_at` datetime NOT NULL,
  `user_id` int(11) unsigned DEFAULT NULL,
  `project` varchar(255) NOT NULL,
  `country` varchar(2) DEFAULT NULL,
  `region` varchar(10) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `latitude` decimal(8,5) DEFAULT NULL,
  `longitude` decimal(8,5) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;