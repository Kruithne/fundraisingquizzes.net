<!DOCTYPE html>
	<head>
		<title>
			<?php echo ($this->title === null ? 'Unnamed' : $this->title); ?> - Fundraising Quizzes
		</title>
		<link rel="stylesheet" type="text/css" href="http://static.fundraisingquizzes.net/css/default.css"/>
		<link rel="stylesheet" type="text/css" href="http://fonts.googleapis.com/css?family=Noto+Sans"/>
		<script type="text/javascript">
			var userLoggedIn = <?php echo (Authenticator::IsLoggedIn() ? 'true' : 'false'); ?>;
		</script>
		<script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
		<script src="http://static.fundraisingquizzes.net/scripts/global.js"></script>
		<script src="http://static.fundraisingquizzes.net/scripts/packet_handler.js"></script>
		<script src="http://static.fundraisingquizzes.net/scripts/tooltip.js"></script>
	</head>
	<body>
		<div id="container">
			<div class="module module-padded" id="header">
				<div id="logo">
					<a href="http://www.fundraisingquizzes.net/">
						<img src="http://static.fundraisingquizzes.net/images/logo.png" alt="Fundraising Quizzes"/>
					</a>
				</div>
				<div id="login-status-container">
					<span id="login-status">
						<?php
							if (Authenticator::IsLoggedIn())
							{
								?>
								You are logged in as <?php echo Authenticator::GetLoggedInUsername(); ?>. <a href="logout.php">Logout</a>.
								<?php
							}
							else
							{
								?>
								You are not logged in. <a href="login.php">Login</a> or <a href="login.php">register</a>.
								<?php
							}
						?>
					</span>
				</div>
				<div id="navigation">
					<a id="navigation-home" href="index.php">Home</a>
					<a id="navigation-quizzes" href="quizzes.php">Quizzes</a>
					<a id="navigation-answers" href="answers.php">Answers</a>
					<a id="navigation-forum" href="forum.php">Forum</a>
					<a id="navigation-links" href="links.php">Links</a>
					<a id="navigation-settings" href="settings.php">Settings</a>
					<?php if (Authenticator::IsAdmin()) { ?>
						<a id="navigation-admin" href="admin.php">Admin</a>
					<?php } ?>
				</div>
				<div class="float-padding"></div>
			</div>
			<?php
				// TODO: Move navigation up to top bar below log-in information.
				echo $this->content;
			?>
			<div class="module module-padded">
				<div id="copyright">Copyright &copy; Fundraising Quizzes</div>
				<div id="author">Website by <a href="http://www.kruithne.net/">Stanley Batch</a></div>
				<div class="float-padding"></div>
			</div>
		</div>
	</body>
</html>