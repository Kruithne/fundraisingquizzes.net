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
			<div class="module module-padded">
				<p class="center"><span class="strong"><?php echo $quiz->getTitle(); ?></span> in aid of <span class="strong"><?php echo $quiz->getCharity(); ?></span></p>
				<p class="center">Closes in <span class="time-period"><?php echo $quiz->getClosing(); ?></span> (<span class="time-formal"><?php echo $quiz->getClosing(); ?></span>)</p>
				<p class="center linkable"><?php echo $quiz->getDescription(); ?></p>
				<p class="center linkable"><?php echo $quiz->getExtra(); ?></p>
			</div>
			<?php
		}
	}
?>