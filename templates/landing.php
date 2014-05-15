<div class="module module-padded">
	<div id="weekly-quiz"><p>
			<?php
				if ($this->weeklyQuiz == Quiz::NONE)
					echo 'There is no Quiz of the Week yet!';
				else
					echo 'Quiz of the Week: ' . $this->weeklyQuiz->getName();
			?>
	</p><p>Click here to vote for next weeks Quiz of the Week.</p></div>
	<div id="weekly-trivia"><p>Last months trivia winner: Coming soon!</p><p>Click here to see scores and answer this months trivia.</p></div>
	<div class="float-block"></div>
</div>
<div class="module module-padded">
Fundraising Quizzes is undergoing some maintance, please stand-by! :D
</div>