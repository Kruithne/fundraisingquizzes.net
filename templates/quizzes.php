<script>
	var quizTypeCount = <?php echo count(Quiz::$QUIZ_TYPES); ?>;
	var quizTypes = [<?php
		$types = Array();
		foreach (Quiz::$QUIZ_TYPES as $type)
			$types[] = '"' . $type . '"';

		echo implode(', ', $types);
 	?>];
</script>
<div class="module module-padded">
	<p><b>Voting:</b> You can vote for three quizzes a week, the quiz with the highest vote at the end of each week becomes Quiz of the Week.</p>
	<p><b>Bookmarking:</b> Quizzes you bookmark will show up at the top of the list for you regardless of their closing date.</p>
</div>
<div class="module module-padded" id="submit-button" orig="Want to add your own quiz to this list? Click here to submit one!"></div>
<div class="module module-padded quiz-listing editing" id="quiz-submit">
	<form class="validatable preventDefault" complete="submitQuizSuccess" error="submitQuizError" submit="submitQuizSubmit">
		<div id="quiz-intro">
			<p>When submitting a quiz can you please check you have added the details of where to send for it, if it's available by email (if so add an e-mail address) and who cheques should be payable to. Please make sure you also add what type of quiz it is using the drop down menu below, and also if it is a no-asking quiz or no asking before a certain date. The closing date goes in the heading; there is no need to add it again in the description.</p>
			<p>If you want to announce the winners of your last quiz you can add them on that months winners thread which is always at the top of the forum page, or you can add them (with amount raised, if desired) on your list of answers when you submit them. Space is limited in the description box and quite often people miss out the important bits to try and promote their 'good cause' or try and add information that will help boost the quiz.</p>
			<p>All quizzes appear in closing date order. Quizzes submitted have to be approved before they appear on our site, thus it is not instantaneous. Quizzes are removed automatically within the 24-hour window of the closing date. Lastly, please do check regularly to answer any queries that are submitted regarding your quiz.</p>
		</div>
		<p class="quiz-title"><input type="text" id="title" require="true" placeholder="Title..."/> in aid of <input type="text" id="charity" require="true" placeholder="Charity..."/></p>
		<p class="dateSelector quiz-closing" validate=">" date="now">Closes:
			<select range="days" type="day"></select>
			<select range="months" type="month"></select>
			<select range="year-year+5" type="year"></select>
		</p>
		<div class="quiz-extra visible">
			<p class="quiz-type-input">
				<select id="quiz-type-field">
					<option value="-1" noselect="true" selected>Select a quiz type...</option>
					<?php
						$index = 0;
						foreach (Quiz::$QUIZ_TYPES as $type)
						{
							echo '<option value="' . $index . '">' . $type . '</option>';
							$index++;
						}
					?>
				</select>
			</p>
			<p class="quiz-answer-policy-input">
				<select id="quiz-answer-policy-field">
					<option value="0" selected>No answer policy specified</option>
					<option value="1">No asking allowed</option>
					<option value="2">No asking before</option>
				</select>
			</p>
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
					<div class="quiz-type"><div class="quiz-type-image quiz-type-<?php echo $quiz->getQuizType(); ?>" title="<?php echo $quiz->getQuizTypeName(); ?>" currentType="<?php echo $quiz->getQuizType(); ?>" baseType="<?php echo $quiz->getQuizType(); ?>"></div></div>
					<p class="quiz-title"><span class="quiz-title-title"><?php echo $quiz->getTitle(); ?></span> in aid of <span class="quiz-title-charity"><?php echo $quiz->getCharity(); ?></span></p>
					<p class="dateSelector quiz-closing" validate=">" date="<?php echo $quiz->getClosingDate(); ?>" timestamp="<?php echo $quiz->getClosing(); ?>">Closes in <span class="time-period"><?php echo $quiz->getClosing(); ?></span> (<span class="time-formal"><?php echo $quiz->getClosing(); ?></span>)</p>
					<div class="quiz-extra">
						<p class="quiz-answer-policy" policyValue="<?php echo $quiz->getAnswerPolicy(); ?>"><b>Answer Policy: </b><?php echo $quiz->getAnswerPolicyText(); ?></p>
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