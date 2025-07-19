<?php
	class UserBirthday
	{
		/**
		 * @param int $day
		 * @param int $month
		 */
		public function __construct($day, $month)
		{
			$this->day = $day;
			$this->month = $month;
		}

		/**
		 * @return int
		 */
		public function getDay()
		{
			return $this->day;
		}

		/**
		 * @return int
		 */
		public function getMonth()
		{
			return $this->month;
		}

		public function __toString()
		{
			return $this->getDay() . '/' . $this->getMonth();
		}

		public function getSQL()
		{
			return '0000-' . $this->getMonth() . '-' . $this->getDay();
		}

		private $day;
		private $month;
	}
?>