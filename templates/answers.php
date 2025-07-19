<div class="module module-padded" id="submit-button" orig="Have the answers to a closed quiz not listed here? Click here to submit them!"></div>
<div class="module module-padded quiz-listing editing" id="quiz-submit">
	<form class="validatable preventDefault" complete="submitQuizSuccess" error="submitQuizError" submit="submitQuizSubmit">
		<p class="quiz-title"><input type="text" id="title" require="true" placeholder="Title..."/> in aid of <input type="text" id="charity" require="true" placeholder="Charity..."/></p>
		<p class="dateSelector quiz-closing" validate="<=" date="now">Closes:
			<select range="days" type="day"></select>
			<select range="months" type="month"></select>
			<select range="year-year+5" type="year"></select>
		</p>
		<div class="quiz-extra visible">
			<p class="quiz-answers large">
				<textarea id="answers" require="true" placeholder="Quiz Answers..."></textarea>
			</p>
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
	if (count($this->answers))
	{
		/**
		 * @var QuizAnswers $answer
		 */
		foreach ($this->answers as $answer)
		{
			if (!$answer->isAccepted() && !Authenticator::isLoggedInAsAdmin())
				continue;

			?>
			<div class="quiz-listing answer module module-padded<?php echo $answer->isAccepted() ? '' : ' unapproved'; ?>" id="answer-<?php echo $answer->getId(); ?>">
				<form class="validatable preventDefault" complete="quizEditSuccess" error="quizEditError" submit="quizEditSubmit">
					<div class="quiz-arrow"></div>
					<p class="quiz-title"><span class="quiz-title-title"><?php echo $answer->getTitle(); ?></span> in aid of <span class="quiz-title-charity"><?php echo $answer->getCharity(); ?></span></p>
					<p class="quiz-closing" class="dateSelector" validate=">" date="<?php echo $answer->getClosedDate(); ?>" timestamp="<?php echo $answer->getClosed(); ?>">Closed: <span class="time-period"><?php echo $answer->getClosed(); ?></span> (<span class="time-formal"><?php echo $answer->getClosed(); ?></span>)</p>
					<div class="quiz-extra">
						<p class="quiz-answers large formatted"><?php echo $answer->getAnswers(); ?></p>
					</div>
					<div class="quiz-options">
						<ul>
							<?php
								if (!$answer->isAccepted())
									echo '<li class="quiz-option-approve admin-option">Approve</li>';
							?>
							<li class="quiz-option-edit admin-option">Edit</li>
							<li class="quiz-option-delete admin-option">Delete</li>
						</ul>
					</div>
				</form>
			</div>
			<?php
		}
	}
	else
	{
		?>
		<div class="module module-padded">
			<p class="center">There are no answers listed at the moment, check back later!</p>
		</div>
		<?php
	}
?>
</div>