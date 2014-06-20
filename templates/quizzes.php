<div class="module module-padded">
	<p><b>Voting:</b> You can vote for three quizzes a week, the quiz with the highest vote at the end of each week becomes Quiz of the Week.</p>
	<p><b>Bookmarking:</b> Quizzes you bookmark will show up at the top of the list for you regardless of their closing date.</p>
</div>
<div class="module module-padded" id="submit-button">
	Want to add your own quiz to this list? Click here to submit one!
</div>
<div class="module module-padded quiz-listing editing" id="quiz-submit">
	<form class="validatable preventDefault" complete="submitQuizSuccess" error="submitQuizError" submit="submitQuizSubmit">
		<p class="quiz-title"><input type="text" id="title" require="true" placeholder="Title..."/> in aid of <input type="text" id="charity" require="true" placeholder="Charity..."/></p>
		<p class="dateSelector quiz-closing" validate=">" date="now">Closes:
			<select range="days" type="day"></select>
			<select range="months" type="month"></select>
			<select range="year-year+5" type="year"></select>
		</p>
		<div class="quiz-extra visible">
			<p class="quiz-description"><input type="text" id="description" require="true" placeholder="Description..."/></p>
			<p class="quiz-description-extra"><input type="text" id="extra" placeholder="(Optional) Extra Information... "/></p>
		</div>
		<div class="quiz-options">
			<ul>
				<li class="quiz-option-save">Submit</li>
				<li class="quiz-option-cancel">Cancel</li>
			</ul>
		</div>
	</form>
</div>
<div id="listing-container">
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
			$classes = Array();

			if ($quiz->getUpdateDays() > 0)
				$classes[] = ' updated';

			if ($quiz->getNewDays() > 0)
				$classes[] = ' new';

			if (!$quiz->isAccepted())
				$classes[] = ' unapproved';
			?>
			<div class="module module-padded quiz-listing<?php echo implode($classes); ?>" id="quiz-<?php echo $quiz->getId(); ?>">
				<form class="validatable preventDefault" complete="quizEditSuccess" error="quizEditError" submit="quizEditSubmit">
					<div class="quiz-arrow"></div>
					<p class="quiz-title"><span class="quiz-title-title"><?php echo $quiz->getTitle(); ?></span> in aid of <span class="quiz-title-charity"><?php echo $quiz->getCharity(); ?></span></p>
					<p class="dateSelector quiz-closing" validate=">" date="<?php echo $quiz->getClosing(); ?>">Closes in <span class="time-period"><?php echo $quiz->getClosing(); ?></span> (<span class="time-formal"><?php echo $quiz->getClosing(); ?></span>)</p>
					<div class="quiz-extra">
						<p class="linkable quiz-description"><?php echo $quiz->getDescription(); ?></p>
						<p class="linkable quiz-description-extra"><?php echo $quiz->getExtra(); ?></p>
					</div>
					<div class="quiz-queries">
						<p class="query-title">Queries</p>
						<?php
							foreach ($quiz->getQueries() as $query)
							{
								?>
								<div class="quiz-query" id="query-<?php echo $query->getId(); ?>">
									<p class="quiz-query-question"><b>Q:</b> <?php echo $query->getQuery(); ?> <span>(Queried by <?php echo $query->getQueryUser()->getUsername(); ?>)</span></p>
									<p class="quiz-query-answer"><b>A:</b> <?php echo $query->getAnswer() === NULL ? 'This query has not been answered yet. <a>[Submit Answer]</a>' : $query->getAnswer() . ' <span>(Answered by ' . $query->getAnswerUser()->getUsername() . ')</span>'; ?></p>
								</div>
							<?php
							}
						?>
						<p class="quiz-query-submit"><a>&raquo; Submit a query for this quiz &laquo;</a></p>
					</div>
					<div class="quiz-options">
						<ul>
							<?php
								if (!$quiz->isAccepted())
									echo '<li class="quiz-option-approve admin-option">Approve</li>';
							?>
							<li class="quiz-option-edit admin-option">Edit</li>
							<li class="quiz-option-delete admin-option">Delete</li>
							<li class="quiz-option-queries">Queries</li>
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
</div>