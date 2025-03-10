-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 01, 2025 at 04:38 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `docusignfinal2`
--

-- --------------------------------------------------------

--
-- Table structure for table `boxes`
--

CREATE TABLE `boxes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `document_id` bigint(20) UNSIGNED NOT NULL,
  `type` enum('input','signature') NOT NULL,
  `field_type` varchar(255) DEFAULT NULL,
  `top` float NOT NULL,
  `left` float NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `required` tinyint(1) DEFAULT NULL,
  `width` float DEFAULT 350,
  `height` float DEFAULT 50
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `documents`
--

CREATE TABLE `documents` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `input_boxes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`input_boxes`)),
  `signature_boxes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`signature_boxes`)),
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `path` text NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `type` varchar(50) DEFAULT 'template' CHECK (`type` in ('template','agreement'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `document_submit`
--

CREATE TABLE `document_submit` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `document_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`data`)),
  `status` varchar(255) NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `type` varchar(50) DEFAULT 'template' CHECK (`type` in ('template','agreement')),
  `pdfpath` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '2019_12_14_000001_create_personal_access_tokens_table', 1),
(2, '2025_01_12_120847_create_users_table', 1),
(3, '2025_01_13_152045_create_documents_table', 1),
(4, '2025_01_13_153611_create_boxes_table', 2),
(5, '2025_01_13_201313_create_document_submit_table', 3);

-- --------------------------------------------------------

--
-- Table structure for table `one_time_links`
--

CREATE TABLE `one_time_links` (
  `id` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  `used` tinyint(1) NOT NULL DEFAULT 0,
  `email` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `created_at`, `updated_at`) VALUES
(1, 'App\\Models\\User', 3, 'authToken', 'baafd721318c9043378767934949e843315882e6ca31beaae8d589fb6dd3037d', '[\"*\"]', NULL, '2025-02-19 18:48:20', '2025-02-19 18:48:20'),
(2, 'App\\Models\\User', 3, 'authToken', 'cfcb0887611385debab6a71124eb537139695b18b7feee8753bcf3dfc05d02c5', '[\"*\"]', '2025-02-19 18:55:48', '2025-02-19 18:50:06', '2025-02-19 18:55:48'),
(3, 'App\\Models\\User', 12, 'authToken', '152a3b5c962372db567afbd6391d778172bb60056537d8b7bea778cc656f2948', '[\"*\"]', NULL, '2025-02-19 18:50:23', '2025-02-19 18:50:23'),
(4, 'App\\Models\\User', 12, 'authToken', '6ed2fbdc550dba9dc54a9d17cafb0a071d1ece097e3f04e70bee537da8889cee', '[\"*\"]', '2025-02-19 18:54:50', '2025-02-19 18:50:49', '2025-02-19 18:54:50'),
(5, 'App\\Models\\User', 3, 'authToken', '69c26edc3566a29e8a3708b895b1b6527701be4d566d59a8ba93922d56f64723', '[\"*\"]', '2025-02-26 04:42:43', '2025-02-19 22:28:44', '2025-02-26 04:42:43'),
(6, 'App\\Models\\User', 13, 'authToken', '1be78c7fec3823eaece77397c66cde378c791d90a253d749a77b9ee9193b579b', '[\"*\"]', NULL, '2025-02-19 22:29:24', '2025-02-19 22:29:24'),
(7, 'App\\Models\\User', 13, 'authToken', 'ed2f8b41a3c3be6f843c42d917dd9b59b33cac8b2a9ecb761ff688f193e6ec59', '[\"*\"]', '2025-02-19 22:31:22', '2025-02-19 22:31:14', '2025-02-19 22:31:22'),
(8, 'App\\Models\\User', 3, 'authToken', 'aceb1b2f43ff95b0bd8f265672d2d8cad2b777cc917deeb8226f8f9a0e632200', '[\"*\"]', '2025-02-20 00:45:41', '2025-02-19 22:53:03', '2025-02-20 00:45:41'),
(9, 'App\\Models\\User', 14, 'authToken', '59d44798cd2395de3c52f2be52c3970380c55592c414a3d9bc65d56b7e88ceb0', '[\"*\"]', NULL, '2025-02-20 00:14:16', '2025-02-20 00:14:16'),
(10, 'App\\Models\\User', 15, 'authToken', '921a76e3d516df7e28af2bab711a170ecd3684a3edb8f9ef8bf1a84c3d22cb6a', '[\"*\"]', NULL, '2025-02-20 00:14:31', '2025-02-20 00:14:31'),
(11, 'App\\Models\\User', 16, 'authToken', '88233e9403c0a7b7e379efe6c6aab449ebec37a80c073a82a0cc5bb6f7efe2da', '[\"*\"]', NULL, '2025-02-20 00:19:53', '2025-02-20 00:19:53'),
(12, 'App\\Models\\User', 3, 'authToken', 'c934d19f08af3ce0fd43777a415d4c7f717cbe1c04ab07b7c4bb89368aad7192', '[\"*\"]', '2025-02-22 04:12:55', '2025-02-20 03:51:31', '2025-02-22 04:12:55'),
(13, 'App\\Models\\User', 17, 'authToken', 'b24662210cc09f022dbe61c501fcebcc616c20700521851b710e1f2b76edfb2b', '[\"*\"]', NULL, '2025-02-20 03:52:14', '2025-02-20 03:52:14'),
(14, 'App\\Models\\User', 17, 'authToken', '5947faad18b90616f7909bb5b05a0c092d5c4d2cb3f388861341e9220432665f', '[\"*\"]', '2025-02-20 03:52:39', '2025-02-20 03:52:28', '2025-02-20 03:52:39'),
(15, 'App\\Models\\User', 3, 'authToken', '629a8b4c385e2ad585259f5df985ac02114636a441f4db09384ab49e8ef00830', '[\"*\"]', '2025-02-20 04:03:57', '2025-02-20 04:02:43', '2025-02-20 04:03:57'),
(16, 'App\\Models\\User', 12, 'authToken', '1d07287ded8515ed550c44ffb219727c9d9f23c61de5824a0ceff6a73ffba1dd', '[\"*\"]', '2025-02-20 04:13:37', '2025-02-20 04:02:51', '2025-02-20 04:13:37'),
(17, 'App\\Models\\User', 3, 'authToken', '22a0e29ee601cb1af9b5e6ef1dbb644d393de5bdf400ca6e63ae200bb8ca6569', '[\"*\"]', '2025-02-20 21:50:02', '2025-02-20 04:14:10', '2025-02-20 21:50:02'),
(18, 'App\\Models\\User', 12, 'authToken', '838df8f9a73843cc6be4222b78010a03452dc41879f4caa483d8be57782bc683', '[\"*\"]', NULL, '2025-02-20 04:14:12', '2025-02-20 04:14:12'),
(19, 'App\\Models\\User', 3, 'authToken', '6344e266aed12d775afc0dd3b0de7e1b93a31fe564f348ba975d6b987aface4b', '[\"*\"]', '2025-02-20 04:37:38', '2025-02-20 04:32:12', '2025-02-20 04:37:38'),
(20, 'App\\Models\\User', 17, 'authToken', '7b7d814d637a178d6840443cd38eac8c585d337a96e119a09cb03e7a6125e551', '[\"*\"]', '2025-02-20 04:37:52', '2025-02-20 04:34:24', '2025-02-20 04:37:52'),
(21, 'App\\Models\\User', 17, 'authToken', '8a3813dd7c19b398d8042567d6eca29251c183044b131b6e1efa2db06e9e6a21', '[\"*\"]', '2025-02-20 04:56:59', '2025-02-20 04:56:46', '2025-02-20 04:56:59'),
(22, 'App\\Models\\User', 17, 'authToken', 'ee05d4b9a34f04c36dfe2bf459a5c87054f88501f2c7c93093b79a4055fbde82', '[\"*\"]', NULL, '2025-02-20 05:35:41', '2025-02-20 05:35:41'),
(23, 'App\\Models\\User', 3, 'authToken', 'cd3fa2d3049313769e5809d803bfe28ae35c64188ec552cbe55f926ae27d904e', '[\"*\"]', '2025-02-26 05:44:17', '2025-02-20 05:35:41', '2025-02-26 05:44:17'),
(24, 'App\\Models\\User', 3, 'authToken', '1460f30cf5e48f2cdd24b7f89b537ea69dbfd51bf07e8261846a7b9a6a2d25a3', '[\"*\"]', '2025-02-20 05:53:43', '2025-02-20 05:44:03', '2025-02-20 05:53:43'),
(25, 'App\\Models\\User', 18, 'authToken', 'e3f5a35762089f753803d1e3c7ae22c4af925144dd8acd685476976c1068f950', '[\"*\"]', NULL, '2025-02-20 05:44:57', '2025-02-20 05:44:57'),
(26, 'App\\Models\\User', 18, 'authToken', '2b3c0a53c91ed8f39c3517a848a5911eb512512bbeb49eb0790bf4bbd12b6ce8', '[\"*\"]', '2025-02-20 05:57:02', '2025-02-20 05:49:33', '2025-02-20 05:57:02'),
(27, 'App\\Models\\User', 3, 'authToken', 'bbd6b3714fc58f3898fb1b6010181ae15f3d835c0c6be8f1d4f41e831ad74d9f', '[\"*\"]', '2025-02-20 06:02:13', '2025-02-20 05:55:49', '2025-02-20 06:02:13'),
(28, 'App\\Models\\User', 18, 'authToken', 'd53e3e52dd72e5c736a54c3cf74dfce88c8713ab85dde87cedc38953ebd5ce9f', '[\"*\"]', '2025-02-20 06:02:16', '2025-02-20 05:57:20', '2025-02-20 06:02:16'),
(29, 'App\\Models\\User', 3, 'authToken', '1c72fd9fc3e7449ba220406026597615447f502fe470966fb03ed3ab449b9dad', '[\"*\"]', '2025-02-20 06:51:37', '2025-02-20 06:08:07', '2025-02-20 06:51:37'),
(30, 'App\\Models\\User', 18, 'authToken', '5cef01575ded97eb6affdef2b1f0326d65f89b134ced0775e8b767440950449b', '[\"*\"]', NULL, '2025-02-20 06:15:18', '2025-02-20 06:15:18'),
(31, 'App\\Models\\User', 3, 'authToken', '0ea2a6ada5ebf3c1f1dbb369324a54f58bbf20db5030ae2475970445b7bd387a', '[\"*\"]', '2025-02-20 06:34:46', '2025-02-20 06:16:04', '2025-02-20 06:34:46'),
(32, 'App\\Models\\User', 18, 'authToken', 'b539f7ca3299580e4251c30aae706a0616b26af5d010a8745a3df636cfe6dc15', '[\"*\"]', '2025-02-20 06:34:36', '2025-02-20 06:17:06', '2025-02-20 06:34:36'),
(33, 'App\\Models\\User', 18, 'authToken', 'ff530ec7a0c7477c8d0f0906c7a14e2e752dfc0f6bdef0ba145d255d753ec180', '[\"*\"]', '2025-02-20 23:59:47', '2025-02-20 06:35:16', '2025-02-20 23:59:47'),
(34, 'App\\Models\\User', 3, 'authToken', 'a8054d125f47fa27b09aa803f073d04f573a85e58d6fe59bbe948b3eabe9abaa', '[\"*\"]', '2025-02-20 06:46:07', '2025-02-20 06:36:23', '2025-02-20 06:46:07'),
(35, 'App\\Models\\User', 3, 'authToken', 'a7d08ae9e14683d621f083d778430807538d4e76f46239ca539a434c726f1cf6', '[\"*\"]', NULL, '2025-02-20 08:22:20', '2025-02-20 08:22:20'),
(36, 'App\\Models\\User', 3, 'authToken', 'e777f6b94b47d70cf1a63128127ee98cf5f8fe84e1287d80e6d073c960efb6ea', '[\"*\"]', '2025-02-22 04:14:02', '2025-02-20 08:54:39', '2025-02-22 04:14:02'),
(37, 'App\\Models\\User', 19, 'authToken', '4fd0bf2203311b69a89ab935f4e9bc69ca03b393117b1a532d000002fa9d9a56', '[\"*\"]', NULL, '2025-02-20 08:56:19', '2025-02-20 08:56:19'),
(38, 'App\\Models\\User', 19, 'authToken', '2192b7159fbf4a2df1a25a2d4d61f90d093afc27f6d72704d3b43569770beda0', '[\"*\"]', '2025-02-22 04:12:23', '2025-02-20 08:57:22', '2025-02-22 04:12:23'),
(39, 'App\\Models\\User', 3, 'authToken', '7debdd625610b95efe9bd9a83e234bffbec082bd38d05f0102d84c711ab8344a', '[\"*\"]', '2025-02-26 04:23:50', '2025-02-20 22:24:55', '2025-02-26 04:23:50'),
(40, 'App\\Models\\User', 18, 'authToken', '6cee2f3db244dcdac146c43665cc49aa083c851aa593d78aeb3f42061c4f906c', '[\"*\"]', '2025-02-20 22:43:23', '2025-02-20 22:25:05', '2025-02-20 22:43:23'),
(41, 'App\\Models\\User', 3, 'authToken', 'c063fb8aa417ffdd1f31cc1b702af52fb464d56062cae07f0d90b4930ee48dfb', '[\"*\"]', '2025-02-21 01:50:17', '2025-02-20 23:47:46', '2025-02-21 01:50:17'),
(42, 'App\\Models\\User', 18, 'authToken', 'ca90810a1ec6d51b8cbf84aea7224bc5d34fe910a6e433e0519fd0553648723f', '[\"*\"]', '2025-02-21 01:06:35', '2025-02-21 00:46:25', '2025-02-21 01:06:35'),
(43, 'App\\Models\\User', 18, 'authToken', 'b7aa894da33a40d3ebb8649912d36938cad7ab995ae77287b4e224398b860707', '[\"*\"]', '2025-02-21 03:29:23', '2025-02-21 01:33:26', '2025-02-21 03:29:23'),
(44, 'App\\Models\\User', 3, 'authToken', '25c0e0f844a176cab19f3b627a45fb67a2ae61151cf15ce36065bce9f993c1aa', '[\"*\"]', '2025-02-21 05:37:26', '2025-02-21 01:33:30', '2025-02-21 05:37:26'),
(45, 'App\\Models\\User', 3, 'authToken', '5491072a1b6bb730e9663f04f88e9376878b6cd1d0a63c240a9be7b9515d3073', '[\"*\"]', '2025-02-21 02:34:11', '2025-02-21 01:40:47', '2025-02-21 02:34:11'),
(46, 'App\\Models\\User', 20, 'authToken', '7c5206e4ec54d3fc1f11f18033ed329337d3278ba490f612d6b0621850d5060b', '[\"*\"]', NULL, '2025-02-21 01:41:12', '2025-02-21 01:41:12'),
(47, 'App\\Models\\User', 20, 'authToken', '93925e36b644b45dd93886d2fdc2a40a1ca642ba69765b5b69e0cb033a388b9b', '[\"*\"]', '2025-02-21 02:33:46', '2025-02-21 01:50:50', '2025-02-21 02:33:46'),
(48, 'App\\Models\\User', 3, 'authToken', 'fc660f15557e633d2e711e15580b935e301cf0fe67250f78bead40b9b77cb8b1', '[\"*\"]', '2025-02-21 14:46:57', '2025-02-21 14:46:46', '2025-02-21 14:46:57'),
(49, 'App\\Models\\User', 21, 'authToken', '6a3604d47bc88cb099ee55bafc3a592ea5f8a130a3b89d8766f3b2a594b4e779', '[\"*\"]', NULL, '2025-02-21 21:32:17', '2025-02-21 21:32:17'),
(50, 'App\\Models\\User', 22, 'authToken', '80b6b182cadd5f507f3c48538ea260d71712bbfbbd9ef09196726f6a53edd105', '[\"*\"]', NULL, '2025-02-21 21:32:53', '2025-02-21 21:32:53'),
(51, 'App\\Models\\User', 3, 'authToken', '4ca6e842869f5cdbe4bb25d951358c1d183fc64969b45fd658f4c707d3acfea2', '[\"*\"]', '2025-02-21 23:19:05', '2025-02-21 23:18:13', '2025-02-21 23:19:05'),
(52, 'App\\Models\\User', 3, 'authToken', 'de5fb72a349ee54d3f435808fad50d917a2c1cd1fb5d9210a830c8272c6d55fd', '[\"*\"]', '2025-02-22 04:45:10', '2025-02-21 23:29:03', '2025-02-22 04:45:10'),
(53, 'App\\Models\\User', 18, 'authToken', '96fffef7ab0fdbcb828c50a86977553fcad3c0532255e4823c4590c20b6617d6', '[\"*\"]', '2025-02-22 04:01:00', '2025-02-22 01:50:16', '2025-02-22 04:01:00'),
(54, 'App\\Models\\User', 3, 'authToken', '5e96da83e8143034dcefbc1012f088f35a467cf04316fc4fe6e0b3bc1b82cabf', '[\"*\"]', '2025-02-22 03:25:46', '2025-02-22 02:16:30', '2025-02-22 03:25:46'),
(55, 'App\\Models\\User', 3, 'authToken', '7fe976f55c54a33df2811b5674fdd336a28954ad7a643bb704f6d1c0862098dc', '[\"*\"]', '2025-02-26 04:58:26', '2025-02-22 03:26:15', '2025-02-26 04:58:26'),
(56, 'App\\Models\\User', 20, 'authToken', 'd96e287790cceaa40a49a72f6c9ea66ac3541cbbb9eaf8f5a30e0e730fa68443', '[\"*\"]', '2025-02-22 03:36:54', '2025-02-22 03:31:02', '2025-02-22 03:36:54'),
(57, 'App\\Models\\User', 23, 'authToken', '84e6cc15fd5be1441ab25b53d9aec5c6a88e290ae010510359335e18b2abddda', '[\"*\"]', NULL, '2025-02-22 03:41:27', '2025-02-22 03:41:27'),
(58, 'App\\Models\\User', 23, 'authToken', '45fb2846627a97750db2957730f53e2eb1909bba02ad8bee11e70d9861ed387f', '[\"*\"]', '2025-02-22 04:11:46', '2025-02-22 03:48:00', '2025-02-22 04:11:46'),
(59, 'App\\Models\\User', 3, 'authToken', '4bb2a31f4cb6169ee36368cdcf1b02b2125da0cba2f1525f3a36cf433dfa9920', '[\"*\"]', '2025-02-22 04:54:03', '2025-02-22 04:53:28', '2025-02-22 04:54:03'),
(60, 'App\\Models\\User', 3, 'authToken', 'e701e688f9f4e14bc9220dff44d66f643c84aa1c61bb6389065da38ff1fad83f', '[\"*\"]', '2025-02-22 05:26:44', '2025-02-22 05:08:30', '2025-02-22 05:26:44'),
(61, 'App\\Models\\User', 3, 'authToken', 'f3ed310a0244bedf6669d48434ff7f4df359cf903186e331439d83ce81b268d6', '[\"*\"]', '2025-02-24 22:28:54', '2025-02-22 22:22:29', '2025-02-24 22:28:54'),
(62, 'App\\Models\\User', 3, 'authToken', '3023fd6379d8b31f5eb0356bca7d29562ccd65b5cddc2e638099734703448e57', '[\"*\"]', '2025-02-23 02:05:14', '2025-02-23 01:10:51', '2025-02-23 02:05:14'),
(63, 'App\\Models\\User', 23, 'authToken', '70d5af3d33ae62ed3b8992c19d3ab417848230387f0cd43b948902885b93b0bd', '[\"*\"]', '2025-02-23 02:21:11', '2025-02-23 01:12:08', '2025-02-23 02:21:11'),
(64, 'App\\Models\\User', 23, 'authToken', 'f2a1d6d32904b703cb2c1648151224f6d79de92a48757df452f13e7fbfe12f99', '[\"*\"]', '2025-02-23 02:12:13', '2025-02-23 01:22:40', '2025-02-23 02:12:13'),
(65, 'App\\Models\\User', 3, 'authToken', '95baa23a1f2784af7a2ea5c5df5eb67ca1767c77f3405d319aeef2d0cc743b83', '[\"*\"]', '2025-02-25 00:21:38', '2025-02-24 14:58:15', '2025-02-25 00:21:38'),
(66, 'App\\Models\\User', 3, 'authToken', '7ab121cb244f375d44192d3196427a1d3a3237237a6651b02a5b8a7cab580997', '[\"*\"]', '2025-02-24 17:12:09', '2025-02-24 17:12:04', '2025-02-24 17:12:09'),
(67, 'App\\Models\\User', 3, 'authToken', '562a4f2d958f542d236a4e4b990e3b7b68fb3419fd04fec4b2c71e86d9dee252', '[\"*\"]', '2025-02-26 04:22:24', '2025-02-24 22:35:16', '2025-02-26 04:22:24'),
(68, 'App\\Models\\User', 3, 'authToken', '1ca5f04edf5aba9842749cd147cd24cbf8d64fe6af14574f2c3be2243c8b5cb7', '[\"*\"]', '2025-02-25 04:35:52', '2025-02-24 22:36:29', '2025-02-25 04:35:52'),
(69, 'App\\Models\\User', 18, 'authToken', '4b81d5577df29618c0971cc7f0c86a438e0caf9c1dc6f2fa29630120349c86f2', '[\"*\"]', '2025-02-28 06:57:16', '2025-02-25 01:07:23', '2025-02-28 06:57:16'),
(70, 'App\\Models\\User', 23, 'authToken', '6cf657c27aeea3b86f74c4ee893b1051992d6974ea688a793b4baf84c5039a1f', '[\"*\"]', '2025-02-25 02:09:05', '2025-02-25 01:31:19', '2025-02-25 02:09:05'),
(71, 'App\\Models\\User', 3, 'authToken', '865dcec91dd717e0bd3a840df408a87103194ba1c6e5bc7ebe06eae95d3c4a7d', '[\"*\"]', '2025-02-25 02:04:04', '2025-02-25 01:42:06', '2025-02-25 02:04:04'),
(72, 'App\\Models\\User', 23, 'authToken', '46400edbf757b1dff459a17ff28bba5b4a0f7178d92cd44efed1c2dd5671fcf8', '[\"*\"]', '2025-02-25 03:27:23', '2025-02-25 03:09:02', '2025-02-25 03:27:23'),
(73, 'App\\Models\\User', 24, 'authToken', '7bda1380d6c9bc577bc8df2dd66692c5fd7e3468d8dc6000369ee9c63e1ed66d', '[\"*\"]', NULL, '2025-02-25 05:35:05', '2025-02-25 05:35:05'),
(74, 'App\\Models\\User', 3, 'authToken', 'd9f773700401810984b0ea6e4a554061e3d19e088135b03f98a161e41d50676e', '[\"*\"]', '2025-02-25 05:42:09', '2025-02-25 05:41:17', '2025-02-25 05:42:09'),
(75, 'App\\Models\\User', 24, 'authToken', 'be5d0490d77dd00cd17a6b3f2979433d0db201faffecfdc7f88fc4cfcff15952', '[\"*\"]', '2025-02-25 05:45:27', '2025-02-25 05:43:01', '2025-02-25 05:45:27'),
(76, 'App\\Models\\User', 23, 'authToken', '5f96292ad244f225d67f154a7a31bb1204c13d7f273f791b1c487a6c01ef778c', '[\"*\"]', '2025-02-26 04:31:00', '2025-02-25 23:11:57', '2025-02-26 04:31:00'),
(77, 'App\\Models\\User', 3, 'authToken', 'dc2a14dfa7402975b6213b9a84c7162fe0672df37664ef41ae34bed5c6b1bbab', '[\"*\"]', '2025-02-25 23:28:16', '2025-02-25 23:15:13', '2025-02-25 23:28:16'),
(78, 'App\\Models\\User', 18, 'authToken', '536e7d4dee5ede566b7d00d03362540cf2d96eb327bcbe5fd1fe6588db6b3354', '[\"*\"]', '2025-02-26 05:07:03', '2025-02-25 23:18:26', '2025-02-26 05:07:03'),
(79, 'App\\Models\\User', 3, 'authToken', '0cc3f523a8084728f939353a4919d99d591ab526f43bd76dc74d29d364386119', '[\"*\"]', '2025-02-26 05:17:42', '2025-02-26 04:12:11', '2025-02-26 05:17:42'),
(80, 'App\\Models\\User', 23, 'authToken', '6d58a58d95555536b9e4b5ab9baa1c2af5e0a30d3b67b9d4943ada891eb5fa5d', '[\"*\"]', '2025-02-26 04:13:37', '2025-02-26 04:13:10', '2025-02-26 04:13:37'),
(81, 'App\\Models\\User', 3, 'authToken', '78ffcf706c9cb3f8552b963b77d11d8bfc1118eb76acca60c09e355d177bfcc9', '[\"*\"]', '2025-02-26 04:58:05', '2025-02-26 04:14:24', '2025-02-26 04:58:05'),
(82, 'App\\Models\\User', 3, 'authToken', '982bc6ef0b7556ad3c8f056d4bb42a55db903989915fe246296a0f0783955c03', '[\"*\"]', NULL, '2025-02-26 04:22:17', '2025-02-26 04:22:17'),
(83, 'App\\Models\\User', 3, 'authToken', 'd52eebc8ce77fc4a6c0d9f0775ad62e98617e5d96be6d82d81f0d46a1ef9fbce', '[\"*\"]', '2025-02-26 04:39:58', '2025-02-26 04:25:32', '2025-02-26 04:39:58'),
(84, 'App\\Models\\User', 3, 'authToken', '18cc637ebe779e82b315d3540c31592c1575707abe437a881f8cae68bed94991', '[\"*\"]', '2025-02-26 04:26:45', '2025-02-26 04:26:40', '2025-02-26 04:26:45'),
(85, 'App\\Models\\User', 23, 'authToken', 'dd3808cd994c5839cd2d8b133b42e5fc978f2050cd2421df5e791069e45c0e60', '[\"*\"]', '2025-02-26 05:00:03', '2025-02-26 04:58:48', '2025-02-26 05:00:03'),
(86, 'App\\Models\\User', 3, 'authToken', 'b160ebd72c734dcdf7326f35dd3d60739c728095fc79d09420d9a003c9521b2d', '[\"*\"]', '2025-02-26 05:38:27', '2025-02-26 05:12:16', '2025-02-26 05:38:27'),
(87, 'App\\Models\\User', 23, 'authToken', '9a3fabd630cdb1f3fb0908d7915833039fa17ade7b2373b2ba14c511581dd31b', '[\"*\"]', '2025-02-26 05:16:59', '2025-02-26 05:16:35', '2025-02-26 05:16:59'),
(88, 'App\\Models\\User', 3, 'authToken', '6d419db4a8d64a84f48e4da1d14691ce24d70bf2a7fdb6a60928f88789784106', '[\"*\"]', '2025-02-26 05:40:22', '2025-02-26 05:39:31', '2025-02-26 05:40:22'),
(89, 'App\\Models\\User', 3, 'authToken', 'd9a7dccdde152375d3a6e194d1b3cad6c0104e6a9578fc9653a3882d5ca0fe55', '[\"*\"]', NULL, '2025-02-26 05:45:00', '2025-02-26 05:45:00'),
(90, 'App\\Models\\User', 3, 'authToken', '3c1b53ae0388a6bc9cab9b58d6276e121cff8c908a36b9e061903d8f0b8b9cfd', '[\"*\"]', '2025-02-28 06:56:25', '2025-02-28 06:39:13', '2025-02-28 06:56:25'),
(91, 'App\\Models\\User', 3, 'authToken', 'a8b7284fd7e068b5e83ab5162f6b90491a2a1073de1990c26f14e508e07986a5', '[\"*\"]', '2025-02-28 06:48:41', '2025-02-28 06:48:04', '2025-02-28 06:48:41'),
(92, 'App\\Models\\User', 3, 'authToken', '652e2393350549c10e9b6356e8dcb1b7044858e2cfc33484181890fb2096811b', '[\"*\"]', NULL, '2025-02-28 23:22:31', '2025-02-28 23:22:31'),
(93, 'App\\Models\\User', 3, 'authToken', 'f0515adcf3d7d5b9a29c627de6ae955f81bbc6142a46147a6e6b9b48f784fad2', '[\"*\"]', '2025-03-01 02:11:02', '2025-02-28 23:55:45', '2025-03-01 02:11:02'),
(94, 'App\\Models\\User', 23, 'authToken', '69a1e0d054ed1bb440575c5f299abd536fac95ce14c7aa6efdab43deb283d17d', '[\"*\"]', '2025-02-28 19:01:44', '2025-03-01 00:03:05', '2025-02-28 19:01:44'),
(95, 'App\\Models\\User', 3, 'authToken', 'ddb063a83fa35012fdb4cb5e4f596b0fcb64ba69814e9daf0394d0f1c06672ac', '[\"*\"]', NULL, '2025-02-28 16:31:35', '2025-02-28 16:31:35'),
(96, 'App\\Models\\User', 3, 'authToken', 'fa08342a49a02f5245e605b134ff46e79d8cfa716ecd85e90dca9f0483144f96', '[\"*\"]', NULL, '2025-02-28 19:30:10', '2025-02-28 19:30:10'),
(97, 'App\\Models\\User', 23, 'authToken', 'e1b51549db739c0c8cc947198752ebd2fc3bb718ef49b5c7af02d9c35d7dab09', '[\"*\"]', '2025-03-01 10:36:46', '2025-02-28 19:30:21', '2025-03-01 10:36:46');

-- --------------------------------------------------------

--
-- Table structure for table `signatures`
--

CREATE TABLE `signatures` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `signature_data` longtext NOT NULL,
  `sign_id` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('user','admin') NOT NULL DEFAULT 'user',
  `profile` text DEFAULT NULL,
  `desc` text DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `email_verified_at`, `password`, `role`, `profile`, `desc`, `remember_token`, `created_at`, `updated_at`) VALUES
(3, 'test', 'admin@example.com', NULL, '$2y$10$IfpigYkzsoEOaMAdy8wDieDqhpNGzPG5Y5Xu4yHqXdoDeQUTZk2MS', 'admin', 'null', '', NULL, '2025-01-25 06:56:34', '2025-01-25 06:56:34'),
(18, 'muneeb', 'muneebusmani8355@gmail.com', NULL, '$2y$10$k5cgEu2W3QwhE8cjk62d4.mfENS0q4XoiCeLCdKD4YZPZ69qMue5i', 'user', 'null', '', NULL, '2025-02-20 05:44:57', '2025-02-20 05:44:57'),
(19, 'Mohamud Said', 'mohamud321321@gmail.com', NULL, '$2y$10$Ayy9tafv.m.SGjhm6TmH7uMxwk5Lz4grCwmAPULERZGScFbqEvu6q', 'user', 'null', '', NULL, '2025-02-20 08:56:19', '2025-02-20 08:56:19'),
(21, 'Abdirahman Adam', 'wadeflash06@gmail.com', NULL, '$2y$10$OH5KNIyrCzHckBKw3E4ujeW7SLk1BNzAllRpdo0Zpbf5idBOG8mhe', 'user', 'null', '', NULL, '2025-02-21 21:32:17', '2025-02-21 21:32:17'),
(22, 'Abdirahman Adam', 'aideedabdirahman88@gmail.com', NULL, '$2y$10$BKmjybCPCDYnEZipVM8VF.Y4Pnu.K2KPm9SmgWCqKLlw2UR0fj13i', 'user', 'null', '', NULL, '2025-02-21 21:32:53', '2025-02-21 21:32:53'),
(23, 'bashir testing', 'officialdevcir@gmail.com', NULL, '$2y$10$5BqNnYldkSXjDe6lMRRH0u5svkxYL/7w5amSLm355K9Y73OIQoc7i', 'user', 'null', '', NULL, '2025-02-22 03:41:27', '2025-02-22 03:41:27'),
(24, 'Jack Adams', 'admin01@gmail.com', NULL, '$2y$10$QkEL9tNFdbQErNTzc8EssuC8RAn.JOt9CNVpnQgBqVhrBxm4sAfIi', 'user', 'null', '', NULL, '2025-02-25 05:35:05', '2025-02-25 05:35:05');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `boxes`
--
ALTER TABLE `boxes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `boxes_document_id_foreign` (`document_id`);

--
-- Indexes for table `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `documents_user_id_foreign` (`user_id`);

--
-- Indexes for table `document_submit`
--
ALTER TABLE `document_submit`
  ADD PRIMARY KEY (`id`),
  ADD KEY `document_submit_document_id_foreign` (`document_id`),
  ADD KEY `document_submit_user_id_foreign` (`user_id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `one_time_links`
--
ALTER TABLE `one_time_links`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`);

--
-- Indexes for table `signatures`
--
ALTER TABLE `signatures`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `signatures_sign_id_unique` (`sign_id`),
  ADD KEY `signatures_user_id_foreign` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `boxes`
--
ALTER TABLE `boxes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `documents`
--
ALTER TABLE `documents`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `document_submit`
--
ALTER TABLE `document_submit`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `one_time_links`
--
ALTER TABLE `one_time_links`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=98;

--
-- AUTO_INCREMENT for table `signatures`
--
ALTER TABLE `signatures`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `boxes`
--
ALTER TABLE `boxes`
  ADD CONSTRAINT `boxes_document_id_foreign` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `documents`
--
ALTER TABLE `documents`
  ADD CONSTRAINT `documents_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `document_submit`
--
ALTER TABLE `document_submit`
  ADD CONSTRAINT `document_submit_document_id_foreign` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `document_submit_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `signatures`
--
ALTER TABLE `signatures`
  ADD CONSTRAINT `signatures_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
