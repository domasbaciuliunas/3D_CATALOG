-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               11.5.2-MariaDB - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Version:             12.6.0.6765
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for 3d_catalog
CREATE DATABASE IF NOT EXISTS `3d_catalog` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;
USE `3d_catalog`;

-- Dumping structure for table 3d_catalog.ambient_lights
CREATE TABLE IF NOT EXISTS `ambient_lights` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `intensity` float unsigned DEFAULT NULL,
  `RGB` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_lithuanian_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table 3d_catalog.ambient_lights: ~0 rows (approximately)

-- Dumping structure for table 3d_catalog.catalogs
CREATE TABLE IF NOT EXISTS `catalogs` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `CATALOG_NAME` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_lithuanian_ci DEFAULT NULL,
  `RGB` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_lithuanian_ci DEFAULT NULL,
  `HEADER` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_lithuanian_ci DEFAULT NULL,
  `DARK_LETTERS` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_lithuanian_ci DEFAULT NULL,
  `ILLUSTRATION` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table 3d_catalog.catalogs: ~0 rows (approximately)

-- Dumping structure for table 3d_catalog.catalog_products
CREATE TABLE IF NOT EXISTS `catalog_products` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `CATALOG_ID` int(10) unsigned NOT NULL,
  `PRODUCT_ID` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_catalog_products_catalogs` (`CATALOG_ID`),
  KEY `FK_catalog_products_products` (`PRODUCT_ID`),
  CONSTRAINT `FK_catalog_products_catalogs` FOREIGN KEY (`CATALOG_ID`) REFERENCES `catalogs` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_catalog_products_products` FOREIGN KEY (`PRODUCT_ID`) REFERENCES `products` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table 3d_catalog.catalog_products: ~0 rows (approximately)

-- Dumping structure for table 3d_catalog.countries
CREATE TABLE IF NOT EXISTS `countries` (
  `COUNTRY_ID` int(11) NOT NULL AUTO_INCREMENT,
  `COUNTRY` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_lithuanian_ci NOT NULL,
  `ISO` varchar(4) CHARACTER SET utf8mb4 COLLATE utf8mb4_lithuanian_ci NOT NULL,
  PRIMARY KEY (`COUNTRY_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=195 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table 3d_catalog.countries: ~194 rows (approximately)
INSERT INTO `countries` (`COUNTRY_ID`, `COUNTRY`, `ISO`) VALUES
	(1, 'Afghanistan', 'AF'),
	(2, 'Albania', 'AL'),
	(3, 'Algeria', 'DZ'),
	(4, 'Andorra', 'AD'),
	(5, 'Angola', 'AO'),
	(6, 'Antigua and Barbuda', 'AG'),
	(7, 'Argentina', 'AR'),
	(8, 'Armenia', 'AM'),
	(9, 'Australia', 'AU'),
	(10, 'Austria', 'AT'),
	(11, 'Azerbaijan', 'AZ'),
	(12, 'Bahamas', 'BS'),
	(13, 'Bahrain', 'BH'),
	(14, 'Bangladesh', 'BD'),
	(15, 'Barbados', 'BB'),
	(16, 'Belarus', 'BY'),
	(17, 'Belgium', 'BE'),
	(18, 'Belize', 'BZ'),
	(19, 'Benin', 'BJ'),
	(20, 'Bhutan', 'BT'),
	(21, 'Bolivia', 'BO'),
	(22, 'Bosnia and Herzegovina', 'BA'),
	(23, 'Botswana', 'BW'),
	(24, 'Brazil', 'BR'),
	(25, 'Brunei', 'BN'),
	(26, 'Bulgaria', 'BG'),
	(27, 'Burkina Faso', 'BF'),
	(28, 'Burundi', 'BI'),
	(29, 'Cabo Verde', 'CV'),
	(30, 'Cambodia', 'KH'),
	(31, 'Cameroon', 'CM'),
	(32, 'Canada', 'CA'),
	(33, 'Central African Republic', 'CF'),
	(34, 'Chad', 'TD'),
	(35, 'Chile', 'CL'),
	(36, 'China', 'CN'),
	(37, 'Colombia', 'CO'),
	(38, 'Comoros', 'KM'),
	(39, 'Congo, Democratic Republic of the', 'CD'),
	(40, 'Congo, Republic of the', 'CG'),
	(41, 'Costa Rica', 'CR'),
	(42, 'Croatia', 'HR'),
	(43, 'Cuba', 'CU'),
	(44, 'Cyprus', 'CY'),
	(45, 'Czechia', 'CZ'),
	(46, 'Denmark', 'DK'),
	(47, 'Djibouti', 'DJ'),
	(48, 'Dominica', 'DM'),
	(49, 'Dominican Republic', 'DO'),
	(50, 'Ecuador', 'EC'),
	(51, 'Egypt', 'EG'),
	(52, 'El Salvador', 'SV'),
	(53, 'Equatorial Guinea', 'GQ'),
	(54, 'Eritrea', 'ER'),
	(55, 'Estonia', 'EE'),
	(56, 'Eswatini', 'SZ'),
	(57, 'Ethiopia', 'ET'),
	(58, 'Fiji', 'FJ'),
	(59, 'Finland', 'FI'),
	(60, 'France', 'FR'),
	(61, 'Gabon', 'GA'),
	(62, 'Gambia', 'GM'),
	(63, 'Georgia', 'GE'),
	(64, 'Germany', 'DE'),
	(65, 'Ghana', 'GH'),
	(66, 'Greece', 'GR'),
	(67, 'Grenada', 'GD'),
	(68, 'Guatemala', 'GT'),
	(69, 'Guinea', 'GN'),
	(70, 'Guinea-Bissau', 'GW'),
	(71, 'Guyana', 'GY'),
	(72, 'Haiti', 'HT'),
	(73, 'Honduras', 'HN'),
	(74, 'Hungary', 'HU'),
	(75, 'Iceland', 'IS'),
	(76, 'India', 'IN'),
	(77, 'Indonesia', 'ID'),
	(78, 'Iran', 'IR'),
	(79, 'Iraq', 'IQ'),
	(80, 'Ireland', 'IE'),
	(81, 'Israel', 'IL'),
	(82, 'Italy', 'IT'),
	(83, 'Jamaica', 'JM'),
	(84, 'Japan', 'JP'),
	(85, 'Jordan', 'JO'),
	(86, 'Kazakhstan', 'KZ'),
	(87, 'Kenya', 'KE'),
	(88, 'Kiribati', 'KI'),
	(89, 'Korea, North', 'KP'),
	(90, 'Korea, South', 'KR'),
	(91, 'Kosovo', 'XK'),
	(92, 'Kuwait', 'KW'),
	(93, 'Kyrgyzstan', 'KG'),
	(94, 'Laos', 'LA'),
	(95, 'Latvia', 'LV'),
	(96, 'Lebanon', 'LB'),
	(97, 'Lesotho', 'LS'),
	(98, 'Liberia', 'LR'),
	(99, 'Libya', 'LY'),
	(100, 'Liechtenstein', 'LI'),
	(101, 'Lithuania', 'LT'),
	(102, 'Luxembourg', 'LU'),
	(103, 'Madagascar', 'MG'),
	(104, 'Malawi', 'MW'),
	(105, 'Malaysia', 'MY'),
	(106, 'Maldives', 'MV'),
	(107, 'Mali', 'ML'),
	(108, 'Malta', 'MT'),
	(109, 'Marshall Islands', 'MH'),
	(110, 'Mauritania', 'MR'),
	(111, 'Mauritius', 'MU'),
	(112, 'Mexico', 'MX'),
	(113, 'Micronesia', 'FM'),
	(114, 'Moldova', 'MD'),
	(115, 'Monaco', 'MC'),
	(116, 'Mongolia', 'MN'),
	(117, 'Montenegro', 'ME'),
	(118, 'Morocco', 'MA'),
	(119, 'Mozambique', 'MZ'),
	(120, 'Myanmar', 'MM'),
	(121, 'Namibia', 'NA'),
	(122, 'Nauru', 'NR'),
	(123, 'Nepal', 'NP'),
	(124, 'Netherlands', 'NL'),
	(125, 'New Zealand', 'NZ'),
	(126, 'Nicaragua', 'NI'),
	(127, 'Niger', 'NE'),
	(128, 'Nigeria', 'NG'),
	(129, 'North Macedonia', 'MK'),
	(130, 'Norway', 'NO'),
	(131, 'Oman', 'OM'),
	(132, 'Pakistan', 'PK'),
	(133, 'Palau', 'PW'),
	(134, 'Panama', 'PA'),
	(135, 'Papua New Guinea', 'PG'),
	(136, 'Paraguay', 'PY'),
	(137, 'Peru', 'PE'),
	(138, 'Philippines', 'PH'),
	(139, 'Poland', 'PL'),
	(140, 'Portugal', 'PT'),
	(141, 'Qatar', 'QA'),
	(142, 'Romania', 'RO'),
	(143, 'Russia', 'RU'),
	(144, 'Rwanda', 'RW'),
	(145, 'Saint Kitts and Nevis', 'KN'),
	(146, 'Saint Lucia', 'LC'),
	(147, 'Saint Vincent and the Grenadines', 'VC'),
	(148, 'Samoa', 'WS'),
	(149, 'San Marino', 'SM'),
	(150, 'Sao Tome and Principe', 'ST'),
	(151, 'Saudi Arabia', 'SA'),
	(152, 'Senegal', 'SN'),
	(153, 'Serbia', 'RS'),
	(154, 'Seychelles', 'SC'),
	(155, 'Sierra Leone', 'SL'),
	(156, 'Singapore', 'SG'),
	(157, 'Slovakia', 'SK'),
	(158, 'Slovenia', 'SI'),
	(159, 'Solomon Islands', 'SB'),
	(160, 'Somalia', 'SO'),
	(161, 'South Africa', 'ZA'),
	(162, 'South Sudan', 'SS'),
	(163, 'Spain', 'ES'),
	(164, 'Sri Lanka', 'LK'),
	(165, 'Sudan', 'SD'),
	(166, 'Suriname', 'SR'),
	(167, 'Sweden', 'SE'),
	(168, 'Switzerland', 'CH'),
	(169, 'Syria', 'SY'),
	(170, 'Taiwan', 'TW'),
	(171, 'Tajikistan', 'TJ'),
	(172, 'Tanzania', 'TZ'),
	(173, 'Thailand', 'TH'),
	(174, 'Togo', 'TG'),
	(175, 'Tonga', 'TO'),
	(176, 'Trinidad and Tobago', 'TT'),
	(177, 'Tunisia', 'TN'),
	(178, 'Turkey', 'TR'),
	(179, 'Turkmenistan', 'TM'),
	(180, 'Tuvalu', 'TV'),
	(181, 'Uganda', 'UG'),
	(182, 'Ukraine', 'UA'),
	(183, 'United Arab Emirates', 'AE'),
	(184, 'United Kingdom', 'GB'),
	(185, 'United States', 'US'),
	(186, 'Uruguay', 'UY'),
	(187, 'Uzbekistan', 'UZ'),
	(188, 'Vanuatu', 'VU'),
	(189, 'Vatican City', 'VA'),
	(190, 'Venezuela', 'VE'),
	(191, 'Vietnam', 'VN'),
	(192, 'Yemen', 'YE'),
	(193, 'Zambia', 'ZM'),
	(194, 'Zimbabwe', 'ZW');

-- Dumping structure for table 3d_catalog.cubemaps
CREATE TABLE IF NOT EXISTS `cubemaps` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `cubemap_folder` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_lithuanian_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table 3d_catalog.cubemaps: ~3 rows (approximately)
INSERT INTO `cubemaps` (`id`, `cubemap_folder`) VALUES
	(1, 'colorful-terrazzo'),
	(2, 'black'),
	(3, 'white');

-- Dumping structure for table 3d_catalog.interest_points
CREATE TABLE IF NOT EXISTS `interest_points` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `XYZ` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_lithuanian_ci DEFAULT NULL,
  `text` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_lithuanian_ci DEFAULT NULL,
  `header` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_lithuanian_ci DEFAULT NULL,
  `camera_XYZ` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_lithuanian_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table 3d_catalog.interest_points: ~0 rows (approximately)

-- Dumping structure for table 3d_catalog.models
CREATE TABLE IF NOT EXISTS `models` (
  `ID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `NAME` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_lithuanian_ci DEFAULT NULL,
  `GLB_ID` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_lithuanian_ci DEFAULT NULL,
  `ILLUSTRATION` int(11) DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table 3d_catalog.models: ~0 rows (approximately)

-- Dumping structure for table 3d_catalog.products
CREATE TABLE IF NOT EXISTS `products` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `title_color` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_lithuanian_ci DEFAULT NULL,
  `ip_color` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_lithuanian_ci DEFAULT NULL,
  `arrows` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_lithuanian_ci DEFAULT NULL,
  `menu` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_lithuanian_ci DEFAULT NULL,
  `model_id` int(10) unsigned DEFAULT NULL,
  `cubemap_id` int(11) unsigned NOT NULL,
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_lithuanian_ci DEFAULT NULL,
  `description` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_lithuanian_ci DEFAULT NULL,
  `price` int(10) unsigned DEFAULT NULL,
  `item_scale` float unsigned NOT NULL,
  `original_scale` float unsigned NOT NULL,
  `ILLUSTRATION` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_products_models` (`model_id`),
  KEY `FK_products_cubemaps` (`cubemap_id`),
  CONSTRAINT `FK_products_cubemaps` FOREIGN KEY (`cubemap_id`) REFERENCES `cubemaps` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_products_models` FOREIGN KEY (`model_id`) REFERENCES `models` (`ID`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table 3d_catalog.products: ~0 rows (approximately)

-- Dumping structure for table 3d_catalog.product_ambient_lights
CREATE TABLE IF NOT EXISTS `product_ambient_lights` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `PRODUCT_ID` int(10) unsigned NOT NULL,
  `AL_ID` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_product_ambient_lights_products` (`PRODUCT_ID`),
  KEY `FK_product_ambient_lights_ambient_lights` (`AL_ID`),
  CONSTRAINT `FK_product_ambient_lights_ambient_lights` FOREIGN KEY (`AL_ID`) REFERENCES `ambient_lights` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_product_ambient_lights_products` FOREIGN KEY (`PRODUCT_ID`) REFERENCES `products` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table 3d_catalog.product_ambient_lights: ~0 rows (approximately)

-- Dumping structure for table 3d_catalog.product_interest_points
CREATE TABLE IF NOT EXISTS `product_interest_points` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `PRODUCT_ID` int(10) unsigned NOT NULL,
  `IP_ID` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_product_interest_points_products` (`PRODUCT_ID`),
  KEY `FK_product_interest_points_interest_points` (`IP_ID`),
  CONSTRAINT `FK_product_interest_points_interest_points` FOREIGN KEY (`IP_ID`) REFERENCES `interest_points` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_product_interest_points_products` FOREIGN KEY (`PRODUCT_ID`) REFERENCES `products` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table 3d_catalog.product_interest_points: ~0 rows (approximately)

-- Dumping structure for table 3d_catalog.product_spotlights
CREATE TABLE IF NOT EXISTS `product_spotlights` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `PRODUCT_ID` int(10) unsigned NOT NULL,
  `SPOTLIGHT_ID` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_product_spotlights_products` (`PRODUCT_ID`),
  KEY `FK_product_spotlights_spotlights` (`SPOTLIGHT_ID`),
  CONSTRAINT `FK_product_spotlights_products` FOREIGN KEY (`PRODUCT_ID`) REFERENCES `products` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_product_spotlights_spotlights` FOREIGN KEY (`SPOTLIGHT_ID`) REFERENCES `spotlights` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table 3d_catalog.product_spotlights: ~0 rows (approximately)

-- Dumping structure for table 3d_catalog.sessions
CREATE TABLE IF NOT EXISTS `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) unsigned NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table 3d_catalog.sessions: ~0 rows (approximately)

-- Dumping structure for table 3d_catalog.spotlights
CREATE TABLE IF NOT EXISTS `spotlights` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `intensity` float unsigned DEFAULT NULL,
  `distance` float unsigned DEFAULT NULL,
  `RGB` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_lithuanian_ci DEFAULT NULL,
  `XYZ` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_lithuanian_ci DEFAULT NULL,
  `penumbra` float DEFAULT NULL,
  `angle` float DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table 3d_catalog.spotlights: ~0 rows (approximately)

-- Dumping structure for table 3d_catalog.users
CREATE TABLE IF NOT EXISTS `users` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `NAME` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_lithuanian_ci NOT NULL,
  `SURNAME` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_lithuanian_ci NOT NULL,
  `PASSWORD` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_lithuanian_ci NOT NULL,
  `EMAIL` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_lithuanian_ci NOT NULL,
  `BIRTHDAY` date NOT NULL,
  `COUNTRY_ID` int(11) NOT NULL,
  `IMAGE_ID` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_lithuanian_ci DEFAULT NULL,
  PRIMARY KEY (`ID`) USING BTREE,
  KEY `fk_type` (`COUNTRY_ID`) USING BTREE,
  CONSTRAINT `fk_type` FOREIGN KEY (`COUNTRY_ID`) REFERENCES `countries` (`COUNTRY_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table 3d_catalog.users: ~0 rows (approximately)

-- Dumping structure for table 3d_catalog.users_models
CREATE TABLE IF NOT EXISTS `users_models` (
  `ID` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `USER_ID` int(11) NOT NULL,
  `MODEL_ID` int(11) unsigned NOT NULL,
  PRIMARY KEY (`ID`),
  KEY `FK_users_models_models` (`MODEL_ID`),
  KEY `FK_users_models_users` (`USER_ID`),
  CONSTRAINT `FK_users_models_models` FOREIGN KEY (`MODEL_ID`) REFERENCES `models` (`ID`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_users_models_users` FOREIGN KEY (`USER_ID`) REFERENCES `users` (`ID`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table 3d_catalog.users_models: ~0 rows (approximately)

-- Dumping structure for table 3d_catalog.user_catalogs
CREATE TABLE IF NOT EXISTS `user_catalogs` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `USER_ID` int(10) NOT NULL,
  `CATALOG_ID` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `FK_user_catalogs_users` (`USER_ID`),
  KEY `FK_user_catalogs_catalogs` (`CATALOG_ID`),
  CONSTRAINT `FK_user_catalogs_catalogs` FOREIGN KEY (`CATALOG_ID`) REFERENCES `catalogs` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_user_catalogs_users` FOREIGN KEY (`USER_ID`) REFERENCES `users` (`ID`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table 3d_catalog.user_catalogs: ~0 rows (approximately)

-- Dumping structure for table 3d_catalog.user_products
CREATE TABLE IF NOT EXISTS `user_products` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `USER_ID` int(10) NOT NULL,
  `PRODUCT_ID` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_user_products_users` (`USER_ID`),
  KEY `FK_user_products_products` (`PRODUCT_ID`),
  CONSTRAINT `FK_user_products_products` FOREIGN KEY (`PRODUCT_ID`) REFERENCES `products` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_user_products_users` FOREIGN KEY (`USER_ID`) REFERENCES `users` (`ID`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table 3d_catalog.user_products: ~0 rows (approximately)

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
