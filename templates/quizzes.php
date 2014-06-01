<div class="module module-padded">
	<p class="center">Below you will find a list of the quizzes available on this site along with a description and the charity the quiz is in aid of as well as various options for bookmarking and voting.</p>
</div>
<?php
	if ($this->quizzes == null || !count($this->quizzes))
	{
		echo '<div class="module module-padded"><p class="center">There are currently no quizzes available! Check back at a later time.</p></div>';
	}
	else
	{
		/** @var Quiz $quiz */
		foreach ($this->quizzes as $quiz)
		{
			?>
			<div class="module module-padded quiz-listing" id="quiz-<?php echo $quiz->getId(); ?>">
				<div class="quiz-arrow"></div>
				<p class="quiz-title"><?php echo $quiz->getTitle(); ?> in aid of <?php echo $quiz->getCharity(); ?></p>
				<p class="quiz-closing">Closes in <span class="time-period"><?php echo $quiz->getClosing(); ?></span> (<span class="time-formal"><?php echo $quiz->getClosing(); ?></span>)</p>
				<div class="quiz-extra">
					<p class="linkable"><?php echo $quiz->getDescription(); ?></p>
					<p class="linkable"><?php echo $quiz->getExtra(); ?></p>
				</div>
				<div class="quiz-options">
					<ul>
						<?php
							if (Authenticator::isLoggedInAsAdmin())
								echo '<li class="quiz-option-edit">Edit</li>';
						?>
						<li class="quiz-option-bookmark">Bookmark</li>
						<li class="quiz-option-vote">Vote</li>
					</ul>
				</div>
			</div>
			<?php
		}
	}
?>