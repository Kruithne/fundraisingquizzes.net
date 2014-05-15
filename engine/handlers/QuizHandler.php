<?php
	class QuizHandler
	{
		/**
		 * Return the top-voted quiz for this week.
		 * @return int|Quiz
		 */
		public static function getWeeklyQuiz()
		{
			return Quiz::get(Settings::get('weeklyQuiz'));
		}
	}
?>