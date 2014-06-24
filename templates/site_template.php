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
		<script src="http://static.fundraisingquizzes.net/scripts/packet_handler.js"></script>
		<script src="http://static.fundraisingquizzes.net/scripts/krorms.min.js"></script>
		<?php
			$user = Authenticator::getLoggedInUser();
			if ($user instanceof User)
				echo '<script>var loggedIn = "' . $user->getUsername() . '", isAdmin = ' . ($user->isAdmin() ? 'true' : 'false') . ';</script>';
		?>
		<script src="http://static.fundraisingquizzes.net/scripts/forms.js"></script>
		<script src="http://static.fundraisingquizzes.net/scripts/login.js"></script>
		<?php
			foreach ($this->scripts as $script)
				echo '<script src="http://static.fundraisingquizzes.net/scripts/' . $script . '"></script>';
		?>
	</head>
	<body>
		<div id="container">
		<div class="module module-padded">
			<p id="maintenance">
				<b>20th June:</b> The following features are now operational - Voting, bookmarking, viewing/submitting quiz queries/query answers, account registration.<br/>
				<b>22nd June:</b> The links page and account recovery are now fully working!
			</p>
		</div>
		<div class="module" id="header">
			<a href="http://www.fundraisingquizzes.net/">
				<img id="logo" src="http://static.fundraisingquizzes.net/images/logo.png" alt="Fundraising Quizzes"/>
			</a>
			<div id="account-status"></div>
			<ul id="navigation">
				<li id="navigation-home"><a href="index.php">Home</a></li>
				<li id="navigation-quizzes"><a href="quizzes.php">Quizzes</a></li>
				<li id="navigation-answers"><a href="answers.php">Answers</a></li>
				<li id="navigation-forum">Forum</li>
				<li id="navigation-links"><a href="links.php">Links</a></li>
				<li id="navigation-settings"><a href="settings.php">Settings</a></li>
			</ul>
		</div>
		<?php
			echo $this->content;
		?>
		<div class="module module-padded">
			<div id="copyright">Copyright &copy; Fundraising Quizzes</div>
			<div id="author">Website by <a href="http://www.kruithne.net/">Hannah Batch</a> | Source on <a href="https://github.com/Kruithne/FundraisingQuizzes">GitHub</a> | Avatars by <a href="http://turbomilk.com/">Turbomilk</a> | Icons by <a href="http://www.pixel-mixer.com">PixelMixer</a></div><div class="float-block"></div>
		</div>
		</div>
	</body>
</html>