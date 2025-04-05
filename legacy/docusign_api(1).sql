-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 16, 2025 at 10:02 PM
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
-- Database: `docusign_api`
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
  `top` int(11) NOT NULL,
  `left` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `required` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `boxes`
--

INSERT INTO `boxes` (`id`, `document_id`, `type`, `field_type`, `top`, `left`, `created_at`, `updated_at`, `required`) VALUES
(78, 36, 'input', 'name', 281, 316, '2025-02-16 14:22:27', '2025-02-16 14:22:27', 1),
(79, 36, 'input', 'email', 282, 541, '2025-02-16 14:22:27', '2025-02-16 14:22:27', 1),
(80, 36, 'input', 'date', 333, 570, '2025-02-16 14:22:27', '2025-02-16 14:22:27', 1),
(81, 36, 'signature', NULL, 146, 473, '2025-02-16 14:22:27', '2025-02-16 14:22:27', 1);

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
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `documents`
--

INSERT INTO `documents` (`id`, `name`, `input_boxes`, `signature_boxes`, `status`, `user_id`, `path`, `created_at`, `updated_at`) VALUES
(36, 'demo', '\"[{\\\"top\\\":280.6000061035156,\\\"left\\\":316,\\\"id\\\":0,\\\"fieldType\\\":\\\"name\\\",\\\"required\\\":true,\\\"page\\\":1},{\\\"top\\\":282,\\\"left\\\":541,\\\"id\\\":1,\\\"fieldType\\\":\\\"email\\\",\\\"required\\\":true,\\\"page\\\":1},{\\\"top\\\":333,\\\"left\\\":570,\\\"id\\\":2,\\\"fieldType\\\":\\\"date\\\",\\\"required\\\":true,\\\"page\\\":1}]\"', '\"[{\\\"top\\\":146,\\\"left\\\":473,\\\"id\\\":0,\\\"fieldType\\\":\\\"signature\\\",\\\"page\\\":1,\\\"required\\\":true}]\"', 'active', 3, 'documents/1739733747.docx', '2025-02-16 14:22:27', '2025-02-16 14:22:27');

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
  `email` varchar(255) DEFAULT NULL
) ;

--
-- Dumping data for table `document_submit`
--

INSERT INTO `document_submit` (`id`, `document_id`, `user_id`, `data`, `status`, `created_at`, `updated_at`, `email`) VALUES
(60, 36, 7, '{\"name\":\"Muneeb Usmani\",\"email\":\"muneebusmani8355@gmail.com\",\"date\":\"2026-02-03\",\"signature\":\"data:image\\/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAACWCAYAAABkW7XSAAAAAXNSR0IArs4c6QAAGT9JREFUeF7tXQnwdzdVPVBobdmh0iqLCKKACGVRqrIpliqLtCxlqQsOq0BRRwERiwIVVERmhFEWcUZcyl5WCwoCbkWgQNmKCoIglqotCBRwQ9\\/5z0tJ8+W9d5O3Je+dzDjS75+X3Jwk53dzc+\\/N5aAiBISAEKgEgctVIqfEFAJCQAhAhKVFIASEQDUIiLCqmSoJKgSEgAhLa0AICIFqEBBhVTNVElQICAERltaAEBAC1SAgwqpmqiSoEBACIiytASEgBKpBQIRVzVRJUCEgBERYWgNCQAhUg4AIq5qpkqBCQAiIsLQGhMD8CPw3gMMAc2TJV9v680tWWQ8irMomTOJWg8AxAC5IIKnYwEh0h1cz4gUEFWEtALK62BUC\\/9OjHf0fgBc2RPaIHkSoXfn7kt\\/cCsB5u0KxY7AiLK0CITANApcAOCrSFAmHJJaiKX0JwJFBW9K2Rqqr00yzWhEC9SNAMrlCMIwp7FD\\/C+DyXrtTtFk12tKwqp4+CV8AAiGpfCWiHY0R8wsAruw1QI3NJ7ExbVf3rQiruimTwAUhEJLVuQBuO5N8JCq\\/nAbguTP1VWyzIqxip0aCFY5AaBw\\/GcCrZ5Y57PO\\/ABwxc59FNS\\/CKmo6JEwlCITEseQ+2rVda0mgK1mLElMIdCJwEoCzCrAn\\/Wdw67gbu5YIS7tTCNgQOAfA8QWQlRPhDABPCkQ\\/buv+WiIs22JVrX0jEGo0JbkXhMb4ixpj\\/NFbnS4R1lZnVuOaCgEatq\\/oNVYSWTmxQrvWxQCuNRUAJbUjwippNiRLaQiEZEWPdZ+8SpI3dF7d5N7e5KBKWkWSpVoEQrKqITQmjGPc3P7e3ICq3R4SvCQEaiQrh5\\/vcrG520MRVknbRLKUgEDNZLV50hJhlbBFJEMpCGyBrByW\\/u1hiRcFWXMuwsqCTR9tEIEtkRWn5zHNTeFzvHnaRBiPCGuDO09DSkZga2TlAKBP1jU9NP4UwInJ6BT0gQiroMmQKKsgsFWycmBu6uZQhLXKHlGnhSCwdbJyMPuOpVXfHIqwCtk5EmNxBPZCVpu6ORRhLb5P1GEBCOyNrDZzcyjCKmD3SIRFEdgrWcVIqwbv\\/cssDhHWontFna2MwN7JivDfHsBfevNwLIALV54Xc\\/ciLDNUqlg5AiKrr02gj0VVRngRVuW7UOKbEBBZHQqT7wlfDQ9UI6hpWarSVhG4G4A3RAZ3LwCvHRi0yCoOkP9YazWhOyKsrW7x7Y3rnh3kdCUA3HyxIrLqXwfVaVkirO1t7C2PqEvTOgwAtQS\\/iKyGV4Kf9I\\/OpeHr1cMtLFxDhLUw4OpuNAIx0go3m8jKDnNVWpYIyz6xqlkOAjHS+jyAqwEQWaXNkx+2w8c2vi7t82Vri7CWxVu9TYdAjLSoLfhrujrHyOngSWrJaVnFuziIsJLmVZULQ+C+AF7eIZPIyj5Zflrl8wHczP7psjVFWMvird6mRyBGWiKrNJxvA+Dd7SdFa1kirLSJVe3yEAift3ISntCEoby5PHGLlcjXsorlhWIFK3ZaJVhJCHSRlZNR69s+W2cD+MG2erHplDWh9glVzbIQCMmK\\/\\/2gwKZV9PGmLDgPpCne+C7CKnDVSKRBBMK0v77N6hQAL\\/VakD1rEM5LK4iw7FipphAwIeD7DfGD2PElJK3PBo8xmDraYaXi7VjSsHa4KiseckhW\\/wTgBh3jCUnrgwC+o+KxLyG6CGsJlNXHLhDwNxMHbHmy6ocBvMZD5w8B\\/Ogu0MobpG8XLFKZKVKoPKyjX70dwB0jf3Fn9QsAXGfC\\/tTUPAiEZPW9AP7G2NXrAdzdq\\/tgAL9v\\/HaP1dzeKNL2t3XCeiuAOxtXHSeKqWPvZKyvassgEJJVzpr9XBtn6CTOaWOZ0a7fS9GG9z1N3KdabcoyZk4a\\/49pS1TWQ8DPJDDGReHqAC724gyrSVi3AvQirBVAH+qSUemHD1Xy\\/s5JfBeA2yV8o6r5CJwE4KwA\\/8vnN3fw5QMAnOm10WewH9lV1Z8XbXi3aBtVoz8gPO0bjPpPxYGTetPGUfHvtwzOSmN7PoCHT0xWrrk3Nbavu3ptnwHg9JXGWWq3IqxSZyaQK7SVWMWm9vVeAAwgVRmHwL8A+IaZyMo1+x8Arur1kfpjNW6E5X9d9E2hJuvQBXTRSCdD2UfyNmV4TJ8Lx2sD+IynVY+xjeWNtOyvfF+34vihOIEKmstnAvjZjuOiM0wO4cd6zC\\/07QWNq0RRwrjAufOLU4vjcf7KLRjFBvuuMFk6Eq4A+tRdhh7Wrn336\\/y3zTNU32mwhc2lNUw93iXbC7FlnOAVFxLgiwD46g4L+\\/3+4FXkhcQoqhv3Y1zkWh3SEIpCsgBh\\/gHAt0Tk8DcZc2JfAqDvVouLgrdg9ylgTGuKENoNaV+iC8KSxZeB8\\/LrAH5+SQEK6ssPKuc6\\/1hBsh2IIsLKn5GYkf7jAG4YNDmkfe31ej3E7xlNIPMv5E\\/HqC99fy829AEAtxjVYp0fF30cFGGNX1R3AMDwn5D4nw7gSZHmn9b+e+yH4svNr\\/tR40WqooWQrI4DcN6KknOu6OLgF87HiTs7IhbtNCrCmm6HvKrZcCcHzXHyrw\\/gnyPdfFeT3fEdHRpukbaDiaB6DIDneG2VdEPH40+oHVM+EtmTJxp\\/yc34t7RfCFw\\/ipFbR8Jpp+LfABwdNDkURNrl\\/8XNciyAf51WxNVa463cjQslKyeWf1v5JU\\/jfX9jc7zlasgt03Hxx0FpWPMthBgJfRrAdXu67AoXInE9DMCL5hN39paX8rGaYiC+PeuPAJzaNrr1I2Lxx8FSCasrJUzfYiTY1G6OmWLFTthGjLh4JHpsTx8M0r1G5O+13iyGWmfpR14\\/hxYx51H\\/ZW3sKf\\/7NwA8fsI1UkJTPAJW4ZNW4pEwJSVMbLJLsotQPj70ybfz\\/GKR8VwAt+5YzUPaWgmbwMngayxL+liNweBPAPxQ2wCP5MxUeo5n4+IFAS8KtlKqOA6WqmH5i+CbAXy0NU6nkis3ykcKesWWC\\/\\/rgxVu2cA13yz6G8Ey1pIIwM+h9duNBv\\/oJj3RC5tLlIdu8Ijo\\/6ik7rNF56xo4SJI5BJYSceQmNe8RWOq7WbRd0K0aJSLLnxjZz7hfhOAT7Zv9zHtMtMTcVy\\/uqL\\/mHEYvdVe7KWNLmmfRIWujbBigyABcByWsXCB\\/VVH2uQpJj+ljZh96wUAHmFopO9mcWzeKEP3pirV\\/GoPjCY2DnrjMz+ai3qo2dG0muNgDUdC084IKqUQWGhX8u0u7kh58xwhjN\\/wFoqPf4ZyWEmn6+Vjys4YOd5srVG2QlbEjh74LlQndO7lUfEnW4DpBsGXk5lmu6ZS1VxZtJKawB+rgaWM1Z9o\\/u8xBBfmgaIcKRkL\\/r1xyLxWRHjK9BcJee1Txt9Vt2a7VdeYaEe9UftHPn7BRzBc+T4ANNIzhpR4M8vHE6YAcqE2qnBncFjsgbDCeeevJBfXmsUnO8rh\\/jt2tGXuJj+pXZ\\/cfTeLF7aOqHOOewt2qy58fG32RxonWGrHfuG7hy6NUC1vIPo\\/LhwPx1V02SNhuQnhBuatXQwD30j8oSYX+LdF7GRrYxeSniM+\\/jsdNY\\/sGBv\\/Ngdh+0cnyrI2PnNsPB\\/zI9pXp\\/1+ng3gp9t\\/KN3R1L\\/8qeZSZIuLKmeh9qVHTr2OP7s16nNBd10G1IB7jBAdtv4xgv\\/GBHgkSFdu1iYuzJmLkr\\/xnUq7juwnNP5zr\\/WOiCU6mvI9gg97QNewHg\\/ErUbQhVYx81h1aSZL\\/woxaJqe+zTAW43wC8FUdTddx3H+aDHVTyzfmT9g36m0LzUQbw7dhU1pR0Qfg88HbzYWPbkirO7p6dO6eCPkMlUuNcEx\\/y2GvTBHeV9hFgLawNyzZpxzEWA\\/ZkO3rP5DFr\\/ZptKOtegfEUu5RazyKOjAFWEN002X64CzGS29+WNE+hIADxweymVq9MUsMp6Tt1+WUtq1+J8DuH1LyrEjecqa79Oqrf5Ld2leVHpdq7mzvbWPiKXNl2WNXVonZfKSGt5o5T6HTf7qxoKW54DidwE8JGg498jad7PIcKK+gHLrpp0DgznaHMrdH\\/aZsvnf56WoWeuI6M8XTQ7XmwPEOdsUYeWh61\\/fxxbxUlrXJwAwZMQvucTVF7PY9apMVT48kalOdTIOsWVefr5SzfKpNmFj34piGA8zPXDfMUMCLydiCR7zVmX\\/V1UfBd3QRFjjlsbvAXhwj2vEUsHXsWMrj3wxZ1LLiK2hP77\\/mKXdtetYCco5Ah9mENjP9fVjjYPpHwx8c0cAb2yPiNRgSXjMBDFnCTXHavd9tYLPObuZbXcdJ9jcUkGlMaKhFnDvzDENEVfo7U\\/ipDtHKWUOgoqNLeVoyO95YUNHzXu1jfF4zx+\\/qQs14\\/DJNBfEPXVfi7Qnwpoe5ncCuG2P1jV38PXvNC8bPzIYVu4x0TXTd\\/HQheBSJO36\\/0p7E2pZ0ykalGWFMGD9eW3FlEdZf6n55pfb754L4DRLZ4Y6dIimY7SPBcfMuFVe0FRbLJNb7eAKEHxNrWtK+5aDsutm0QI1NwxJ7AqWyoY6Vu2JTU1NUDHxaMNyKbBTtFpqWWe2R0TecDLZ42cN4+\\/7oQj3dQqJjuh6\\/k9FWPNjzB64mK\\/To3UxBe8DZhIlph1xAz+refD1cZl99t0ssu211xVlYGjM0r5yqUdDBz8zmtIhlYTHty3vCYAhYSkldnxfWstNkTer7toLK0voij8i3k4ziA0jJUNDCgyMhTy\\/g0heGUnhbG176GaRRmvemM65zpz2xIyg7lhmlX\\/qejdoCce1mzJuXpAwpOd7AHyxma\\/7tyQ2JGPMTjXWBDDU52p\\/TwF0NSE32jFDIpj4vyv4+ueat+HoRT1l+akmDIPe17E++UL18Zmd9WVD3ezm6cDKz+HPKIOhUB+\\/GR6Xf6vNsUXcTm+M5r\\/S0c9FTd1rBn\\/jN3wjM3xDIHNay\\/tMhFXGnPSFAc1hfzmlNb7G5p+bjP5BPFKFnuKW9TJ0s1gG4vNK4bs65NwA+kb8VzRa2483\\/lsM7XElhvHQ+5fzjnih1i0LcCFR1E2bFsbF\\/HUB4uwkfBDBkk55CNg+sgy\\/TVkvfdlQqTVQe9hyybVnOUzu0LzM8+qIFhVitjk7Vd+iSFmAW15cpY2NthBqOrFYuJis3BzvbWLWbmMcCMmE9iXr\\/HNTfGsrk7GLS6vFji78I2X+awDcmFssqa4ON2zcDvg6ttXmt7ej9sEasS7YLS6o2saUeo3vHpa9SXvjZCW\\/LlzGHjlITjQoxwpJ7ejaJsQgL8NueDvM4l9u8BKEt4BWcvK7IlHdrfWWN4iwrSoirHrnk8HWV5ngR4cbgE6XRwVQxG6fWGXsEaTvZjE1WWINsxdGA1j3XGi7\\/MVGKyZ2LHQOflQNg59aRit4U\\/er9sYhwHnj5s7VmlIM+X7up\\/CXfmyQ95YN9DS8MyzGssesTrW+k+nb2pCrMU6m41bhCl9bwFxBLHXpIUBNx3mHzzVfFgKLvexDMaewpWyBuOg7RS3VMkdjtFTfyZTRDHQyZbqaXRQLuLsAooBB8lVh5w2fOi+OcJhzqcvwzvfzGK9m0cr6biL912FCjYve+vTazy1dx1DKU9rN4h+30Qmpc0VsTm0uMfh9bgmdTPnaDV+j3nzJAXvzoMw8wFsAeM8IgyvF48Ye+\\/LN9VuvbAuBOU3Kv4l8c\\/NoKLNphoXkwoDep47Ase+dRRqv7zei7dxPOW8cvwWvrtCgsa4OvuyhkykDqZ2NK3eMxX8nwpp3iujs54glFWtn16D3+bvnFfPS1nNuIhmw2xUHycyoDxshe1fMIrF5S+MWwRdq5iy0E1pu8iiPJbVOqquDZWwPb3L2P7+tGHMytbRRTZ3UTVTNwBYW9MWtmm\\/59Y1pJFzwJDfe+pVUUm4i+4Ke39CQ7j1GDOwFTWbOh3bYh0iYMU0vpztnLxzaF1YjeUwG39WBBDOFtug7mdIYb83Hn4PRqt8MTcyqwhXauXO6pHgp+LnjALWYMKlaoUM9RCw+XcXXjVPG7TfCI9WtRwyWV\\/s8asb65zt77uVlaxdWQ7mzETJk6e+sjffU84+GzF3FI\\/DYwvzs\\/GEgNjTMb7LkLrxNghEMitqFC05OxcktcGaVZNrcrRaOj6\\/1pOLDC4YwF30KRnxdmYHhsX77Ao55IcDAYIu8nEMeaXnkmrqMyeowtSxVtWeZuKoGlCEsH7vk7ZrFVhE2734pY46XGaJU\\/wk9sPmklfVoTPye3viUUXPKKdTWaN+LrWO6YfAY+XqjPJSFD0NcLUeQjG94eeBSV3\\/aS\\/6X0dR+PtkbYbk0upzh1LGPsVvsZ0UdOtJUQ741JpKb\\/aU97w8OYW41lA+1M+bvflYHuiZQY1XpQSB109YCJo2ZJxt\\/WWNaExdzn09TLTiUKKf15s3J7rTYKdbqXAkSx+A8pavDGDmq+HaKRbD2QMcawbmBhlK6rD3GrfRP9wc+g+Ufv6dcg\\/7m79KiqWUfWRCgc7g6FDS8aUWZcrFMK9mhreUSE1tyRnB6gVNzUpkeARJBGDs39\\/qyhBR1hf2MzT4xJYJdWR2m7GMTbc29oHJAmoKYuHmWfoAgZ6xrf8Nrenrdu9zrXVrJnOvEohWl4MT23t8kvzsu+KiLuMbE9aXINVRXR8MhhDIMz4YmzVXGEhM7qtmnyQxUpCKdTJ0203UjNyfJWGV3m9BdWDAe0L3D19cG88szT3xY2A7dGX4mwT7ptLBrAGAe\\/ZKJa0p7nXWOqqq3xqIOf1GHAHML7hvbxyGH6pf6d\\/oH0bmvz36zxnxY8ArnLCQiPmN2I0tDiXWYIti9jux\\/yv6f2Niifq39x5SbSH7SRwxralwirIEFssYGYSpYbt7Yrycn7OyRYRyWPUGP6He1aVtcTieHRR8ma+BlGU+sTuyHwZE\\/\\/z\\/DUGo5NlOrorNoDP9nNmFNjw8A4OvaLrtp7pwRo7H5vlLnToRVIGFRJF8t5\\/+mPwqjz7dKHtaF20UyDjNqEnSWZBjKHgu96umrFCMhPsrR55We6k7h8F2SuERYhRKWr5bXtPGGjrP+UclpM9wo3Gi7yFe00GQyAwbteDHi4rt89zHIkRqwbrmRNHTbW0WEVTBhMa5rTKR6H3n4f3MLjZrcJQBOk0fx2H1VzPd9D7jy6fe7J0qaktbY\\/egygPqqif10VRdhFUxYE82xmhECBy8gM+NBTON6B4DvzsSI6Ydp+LfastyP40ltTGVqtyIsEVbqmlH9ihE4tkkYyEDiGMGMTW1zIYBrZ2BDErIk9\\/PNJLkXBRni1fWJgKlrviStHQHaDukQG5aPNiaBG9ubOaQmU+PQPSW3OC0slnpIGpY0rNx1pe82ggC1G\\/fqkD+kCwDQty+38Kb2ppGPSTq0a7lcapb2+Y3v\\/yVFogM1AWNZTqqzBQQYrnVEZCBjX53u88p\\/ckOWZwC4c5uDPiVPGEXlzTKzjqi0CIiwtBT2hgAfHr16ZNDUisbk1KfD84kRwz+1J3rk0zPfL\\/8IgJlHrXvQaWHM1Eo73S6LFaxdgqNBbxqBrqfEGAEQ08SsYLy89QOL7S2SzrMa95rHRRrjI6x0u7EWtrVkhlSrXLPWE2HNCq8arwABxkFeNyInjfZjHgt5BoAn9GhQJJzzg4czQqM7UyHxPUSWob3Kb0mW968A82wRh0DIblgfCoHKEGBKmthrM2OzlJJwSDx9e41kQ+2Khvo+cqKj7DmGTBXuJpKP5W7q+CjCqmxXSdzZEaCj6e0ivfAWj4Ty5ZESkACHHFHZF+1sPPL1FRrl6dw6tI83c3wcGujIudHnQqBaBN4E4K4R6bn56Q7xmQlGRmdUvks4pH09CsDzDP1ZH76t9vgowjKsAlXZNQJ8meeUDuKiA+lURy4+gspn0voKieYtAE4wzAgzrp6bcHxkFpDzDO2uWkWEtSr86rwiBJ7d5uQKRSaJHN+QzTsnGIszuj+oJ42O64Z1PwccxFFayiaOjyIsy1SrjhD4GgKnN1rLUzr8rZjW5qwRYHWF5ljtXrFQpC5xqjw+irBGrC59umsEfqKJKXxRB3GdCuDMDHQssYT0H6NWNWT3ukeTF58pdiwl9faRGiUz9i5eRFiLQ64ON4YA7Uk00E+5l6xt\\/RmAuxjI6yUAeMy0lpTj45T5wAblswIz2JAqCIGdI0AfLhqtp9hTOW0w5vCVBvJitgmGBKUUvjZkCeamhvi6jodDUvrrrJsDzCQdqxEhIARmRWDI7kVyyXkmL\\/X4yOSJU1xIHIAlwpp1zahxIVAEAhe3jqh9+53OqrcE8MFEiVOOj280uG70di\\/CSpwdVRcClSPA0B568lv3fvg+AkOI+nLY83EQPhIydCnA\\/PlHpmJpFTq1XdUXAkKgDgS6XsLOkT4kN3ryH2MMRSJ5MVOGNKwhEPR3ISAEDhCgqwKPhfTncsrM0kpNb39LC6N1IQSEwDYQeGv7GhFT8ExJbiKsbawPjUIIVIsAXR1+AMDhBnITYVU7zRJcCAiByyCgI6EWhBAQAtUgIMKqZqokqBAQAiIsrQEhIASqQUCEVc1USVAhIAREWFoDQkAIVIOACKuaqZKgQkAIiLC0BoSAEKgGARFWNVMlQYWAEPh\\/P2CV08lx+IkAAAAASUVORK5CYII=\"}', 'submit', '2025-02-16 14:22:43', '2025-02-16 15:20:16', NULL);

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

--
-- Dumping data for table `one_time_links`
--

INSERT INTO `one_time_links` (`id`, `token`, `used`, `email`, `created_at`, `updated_at`) VALUES
(3, '19fc881d-086e-4e0c-a080-f94c75ca841a', 0, 'muneebusmani8355@gmail.com', '2025-02-12 12:55:30', NULL),
(4, '3192af90-8fdf-47c0-b0e3-b2a3c424ffa2', 0, 'muneebusmani8355@gmail.com', '2025-02-12 16:30:22', NULL),
(9, '98fb4c86-db3f-414d-b6bf-3bce2edab6fe', 1, 'muneebusmani8355@gmail.com', '2025-02-12 16:53:58', '2025-02-12 18:10:51'),
(10, 'd0db805f-a71e-40b4-960c-31b220c0b56a', 0, 'muneebusmani8355@gmail.com', '2025-02-12 17:02:04', NULL),
(11, 'e52b3493-a497-4ce0-bbfa-14df7b8f023e', 1, 'muneebusmani8355@gmail.com', '2025-02-13 12:57:45', '2025-02-13 12:58:55'),
(12, '06758adc-daab-47ee-913d-81a3ffb5c6c6', 1, 'muneebusmani8355@gmail.com', '2025-02-14 12:12:27', '2025-02-15 13:39:52');

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
(1, 'App\\Models\\User', 1, 'authToken', '03cee84fdb8f9a656db7acfbd8480f7f10682dbb38aa8d83e1ab8f858b2800af', '[\"*\"]', NULL, '2025-01-13 11:04:11', '2025-01-13 11:04:11'),
(2, 'App\\Models\\User', 2, 'authToken', '04801f3ed514b361a59639ac3f5dd7dd80b2b14187fa6a1e9ec2e066cb75946b', '[\"*\"]', NULL, '2025-01-14 12:43:43', '2025-01-14 12:43:43'),
(3, 'App\\Models\\User', 3, 'authToken', '708d887933f6c252caf045076eff3418ebdfc55f03de52c4b4df7f5c86d7b9f2', '[\"*\"]', NULL, '2025-01-25 06:56:34', '2025-01-25 06:56:34'),
(4, 'App\\Models\\User', 3, 'authToken', '5129eba1b4d3758bd63ed50df50c46ac2127dc0552b424545daae3ec1bfa0ccc', '[\"*\"]', '2025-01-25 09:12:13', '2025-01-25 07:00:16', '2025-01-25 09:12:13'),
(5, 'App\\Models\\User', 3, 'authToken', '80959971939965ddbaf902c6e00ff439f38a989b9a6a476e8637ca3adcdf3413', '[\"*\"]', NULL, '2025-01-25 12:23:52', '2025-01-25 12:23:52'),
(6, 'App\\Models\\User', 4, 'authToken', '3b217f5aa3840295b6b9c19497f376e0868efcf1e6540fd268c5a9d456ad4948', '[\"*\"]', NULL, '2025-01-25 13:39:01', '2025-01-25 13:39:01'),
(7, 'App\\Models\\User', 4, 'authToken', '019abf30b6af3add865cc5b8ab5c237fda2040b50810f147ddaf4f2c4505c0e3', '[\"*\"]', '2025-01-25 14:12:50', '2025-01-25 13:57:09', '2025-01-25 14:12:50'),
(8, 'App\\Models\\User', 4, 'authToken', 'b62b2507b07b2367642620e282dde28e859a8f0f405ca6f25a8e0bfaccca5867', '[\"*\"]', '2025-01-25 16:14:11', '2025-01-25 14:15:04', '2025-01-25 16:14:11'),
(9, 'App\\Models\\User', 3, 'authToken', 'b79714c9a3964080e69fb30a84f4ad7c54a7b911d4e5b5d0cbf569709eff8a27', '[\"*\"]', '2025-01-27 05:26:26', '2025-01-27 04:28:28', '2025-01-27 05:26:26'),
(10, 'App\\Models\\User', 4, 'authToken', 'a68f725955babc69f4abb34501a03c6339ed3959812e2d5a104ad848ddafbe15', '[\"*\"]', '2025-01-27 05:26:20', '2025-01-27 04:29:47', '2025-01-27 05:26:20'),
(11, 'App\\Models\\User', 3, 'authToken', '78fbedefbde7cc397d84b2b52083dcac3b821863369e599f0151331efdc06cf2', '[\"*\"]', NULL, '2025-01-27 14:31:25', '2025-01-27 14:31:25'),
(12, 'App\\Models\\User', 4, 'authToken', '12ffce2541460acd8f0c31a6847dd3e0a99247d5ccc633680aa74ca6c5bc115d', '[\"*\"]', '2025-02-09 11:57:33', '2025-01-27 14:31:26', '2025-02-09 11:57:33'),
(13, 'App\\Models\\User', 3, 'authToken', '09ee9e58c9823f32ef2df4fd9cf91ae7120dbd2a7f2e558acf839de9b3f22977', '[\"*\"]', NULL, '2025-01-30 16:50:07', '2025-01-30 16:50:07'),
(14, 'App\\Models\\User', 3, 'authToken', '96b683b6581006f446bda1e2b9d85e74f80e140817e88dc803ad82b6e4af791a', '[\"*\"]', NULL, '2025-02-04 16:43:23', '2025-02-04 16:43:23'),
(15, 'App\\Models\\User', 5, 'authToken', '47993c311f31f476cf3207c2006b803e9073e23057abf03b308d6d21fe9b06ba', '[\"*\"]', NULL, '2025-02-04 16:45:34', '2025-02-04 16:45:34'),
(16, 'App\\Models\\User', 3, 'authToken', '253ece9891b338478de24c0bce9e3869f340b07a96fe67b1e34df1b6fda71e48', '[\"*\"]', NULL, '2025-02-09 11:47:01', '2025-02-09 11:47:01'),
(17, 'App\\Models\\User', 6, 'authToken', 'f99d83bb7167593abc058ffef1f9b2ae9cf456562aa4860e57a04b2cc8c14b43', '[\"*\"]', NULL, '2025-02-09 12:01:02', '2025-02-09 12:01:02'),
(18, 'App\\Models\\User', 6, 'authToken', '9caf94ab211e45e1bc32f62881f1ab66c95ffbf746d9c87f3e3b7bc1d7096099', '[\"*\"]', '2025-02-09 12:01:33', '2025-02-09 12:01:28', '2025-02-09 12:01:33'),
(19, 'App\\Models\\User', 7, 'authToken', '09b88d32837760c8b907933de1078fc8b5c7822531970947470bd5d1df6b3422', '[\"*\"]', NULL, '2025-02-09 12:05:01', '2025-02-09 12:05:01'),
(20, 'App\\Models\\User', 8, 'authToken', '72c205682ddd4fb23e5bd730315c4e1953a8ebd5251d8c554ca286c7ceb4c058', '[\"*\"]', NULL, '2025-02-09 12:05:26', '2025-02-09 12:05:26'),
(21, 'App\\Models\\User', 7, 'authToken', 'e66cf33e9f83f33b4c980a2c1691259a472ddd518796bc2028d5bba591f320b5', '[\"*\"]', '2025-02-10 04:09:12', '2025-02-09 12:08:39', '2025-02-10 04:09:12'),
(22, 'App\\Models\\User', 3, 'authToken', 'ec23cadb592c63d3e86a4d2dc1f38a978a01c95f7d500aa5493708e75e91f2c8', '[\"*\"]', NULL, '2025-02-12 12:43:52', '2025-02-12 12:43:52'),
(23, 'App\\Models\\User', 7, 'authToken', '64e1b3be18d06f558de3b6b406dc0f2242d3376404b77433c17b8eaad5a2afdb', '[\"*\"]', '2025-02-12 14:25:14', '2025-02-12 14:22:59', '2025-02-12 14:25:14'),
(24, 'App\\Models\\User', 3, 'authToken', '3bd79f548a584f74a55cff7e3c5be0e0e61f2832c8752d4cd0ed5bc5728749fa', '[\"*\"]', '2025-02-16 15:26:50', '2025-02-12 14:46:00', '2025-02-16 15:26:50'),
(25, 'App\\Models\\User', 7, 'authToken', '07237adff2787085180633aad8563ba76a667e59d88a0bba719a5c7be9c7e6fb', '[\"*\"]', '2025-02-12 14:49:15', '2025-02-12 14:46:17', '2025-02-12 14:49:15'),
(26, 'App\\Models\\User', 3, 'authToken', 'a76440a8c8881139af3c238c3f2fed5ddc1efd112eddfad4a513fdc653eeacb6', '[\"*\"]', '2025-02-16 14:57:40', '2025-02-12 16:42:11', '2025-02-16 14:57:40'),
(27, 'App\\Models\\User', 7, 'authToken', '90c4d795f1e709606c77f3b1c004201633a6a76100864a18c91ca2a466848415', '[\"*\"]', '2025-02-16 14:57:33', '2025-02-13 15:17:59', '2025-02-16 14:57:33'),
(28, 'App\\Models\\User', 7, 'authToken', 'f9718ca4ecb2f21e981260e619afc02550adfdd82b01ca296c979871417550f5', '[\"*\"]', '2025-02-13 17:47:17', '2025-02-13 17:47:08', '2025-02-13 17:47:17'),
(29, 'App\\Models\\User', 7, 'authToken', '0da84f883982256129afac694ac307c07a00b37cc9e10f18a8142a4964abd683', '[\"*\"]', '2025-02-16 15:20:26', '2025-02-16 10:35:17', '2025-02-16 15:20:26');

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
(7, 'devcir', 'ahsanzafar300@gmail.com', NULL, '$2y$10$zyFjNZEPwXzF8PG0Hr80JucMpOvvsFpSKkhq1JgD4MmJ0Wjfbmq7K', 'user', 'null', '', NULL, '2025-02-09 12:05:01', '2025-02-09 12:05:01'),
(8, 'bashir', 'bashir@gmail.com', NULL, '$2y$10$wkUVFcqlZHaFMikf.lQKH./4WfQZG.XeB.OLbiUi.J2AKS8vD849u', 'user', 'null', '', NULL, '2025-02-09 12:05:26', '2025-02-09 12:05:26');

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
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=82;

--
-- AUTO_INCREMENT for table `documents`
--
ALTER TABLE `documents`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

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
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
