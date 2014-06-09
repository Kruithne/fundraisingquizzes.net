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
			<div class="module module-padded quiz-listing<?php if ($quiz->getUpdateDays() > 0) echo ' updated'; ?><?php if ($quiz->getNewDays() > 0) echo ' new'; ?>" id="quiz-<?php echo $quiz->getId(); ?>">
				<form class="validatable preventDefault" complete="quizEditSuccess" error="quizEditError" submit="quizEditSubmit">
					<div class="quiz-arrow"></div>
					<p class="quiz-title"><span class="quiz-title-title"><?php echo $quiz->getTitle(); ?></span> in aid of <span class="quiz-title-charity"><?php echo $quiz->getCharity(); ?></span></p>
					<p class="quiz-closing" date="<?php echo $quiz->getClosing(); ?>">Closes in <span class="time-period"><?php echo $quiz->getClosing(); ?></span> (<span class="time-formal"><?php echo $quiz->getClosing(); ?></span>)</p>
					<div class="quiz-extra">
						<p class="linkable quiz-description"><?php echo $quiz->getDescription(); ?></p>
						<p class="linkable quiz-description-extra"><?php echo $quiz->getExtra(); ?></p>
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
				</form>
			</div>
			<?php
		}
	}
?>