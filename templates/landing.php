<div class="module module-padded">
	<div id="weekly-quiz"><p>
			<?php
				if ($this->weeklyQuiz instanceof Quiz)
					echo 'Quiz of the Week: ' . $this->weeklyQuiz->getTitle();
				else
					echo 'There is no Quiz of the Week yet!';
			?>
	</p><p><a href="quizzes.php">Click here to vote for next weeks Quiz of the Week.</a></p></div>
	<div id="weekly-trivia"><p>Last months trivia winner: Coming soon!</p><p>Click here to see scores and answer this months trivia.</p></div>
	<div class="float-block"></div>
</div>
<div class="module module-padded">
	<p class="center">Welcome to Fundraising Quizzes, a website designed around a 'no-asking for answers' policy for quizzers to discuss quiz related topics in a light hearted, friendly manner.</p>
	<p class="center">The feature-rich website offers a wide array of features, including a quiz page for charities to advertise upcoming quizzes, a listing of answers for past quizzes and a community driven forum.</p>
	<div id="checklist-container">
		<ul id="checklist">
			<li>Absolutely no answers asked for on-going quizzes.</li>
			<li>Listing is free for all fund-raising/charity quizzes.</li>
			<li>Friendly community based around quiz solving.</li>
			<li>100% free membership with no adverts/pop-ups.</li>
		</ul>
	</div>
</div>