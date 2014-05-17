<!DOCTYPE HTML>
<html>
	<head>
		<title><?php echo $this->title; ?> - Fundraising Quizzes</title>
		<link rel="stylesheet" type="text/css" href="http://static.fundraisingquizzes.net/css/base.css"/>
		<link rel="stylesheet" type="text/css" href="http://fonts.googleapis.com/css?family=Noto+Sans"/>
		<?php
			foreach ($this->styles as $style)
				echo '<link rel="stylesheet" type="text/css" href="http://static.fundraisingquizzes.net/css/' . $style . '"/>';
		?>
		<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js"></script>
		<?php
			foreach ($this->scripts as $script)
				echo '<script src="http://static.fundraisingquizzes.net/scripts/' . $script . '"></script>';
		?>
	</head>
	<body>
		<div id="container">
		<div class="module module-padded">
			<p id="maintenance">We're currently under-going some heavy maintenance, so things might not be working correctly!</p>
		</div>
		<div class="module" id="header">
			<a href="http://www.fundraisingquizzes.net/">
				<img id="logo" src="http://static.fundraisingquizzes.net/images/logo.png" alt="Fundraising Quizzes"/>
			</a>
			<div id="account-status">
				<?php
					if (Authenticator::getLoggedInUser() != User::NONE)
						echo "Something went very, very wrong!";
					else
						echo "You are currently not logged in: login or register.";
				?>
			</div>
			<ul id="navigation">
				<li id="navigation-home"><a href="index.php">Home</a></li>
				<li id="navigation-quizzes"><a href="quizzes.php">Quizzes</a></li>
				<li id="navigation-answers">Answers</li>
				<li id="navigation-forum">Forum</li>
				<li id="navigation-links">Links</li>
				<li id="navigation-settings">Settings</li>
			</ul>
		</div>
		<?php
			echo $this->content;
		?>
		<div class="module module-padded">
			<div id="copyright">Copyright &copy; Fundraising Quizzes</div>
			<div id="author">Website by <a href="http://www.kruithne.net/">Stanley Batch</a> | Icons by <a href="http://www.pixel-mixer.com">PixelMixer</a></div>
			<div class="float-block"></div>
		</div>
		</div>
	</body>
</html>