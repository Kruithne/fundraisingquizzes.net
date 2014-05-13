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
		<div class="module">
			<a href="http://www.fundraisingquizzes.net/">
				<img id="logo" src="http://static.fundraisingquizzes.net/images/logo.png" alt="Fundraising Quizzes"/>
			</a>
		</div>
		<?php
			echo $this->content;
		?>
		</div>
	</body>
</html>