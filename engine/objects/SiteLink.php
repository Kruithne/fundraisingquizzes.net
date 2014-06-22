<?php
	class SiteLink
	{
		/**
		 * Create a new site link object.
		 * @param int $id ID of the link.
		 * @param string $url URL of the site.
		 * @param string $title Title for the site link.
		 * @param string $description Description for the site link.
		 */
		public function __construct($id, $url, $title, $description)
		{
			$this->id = $id;
			$this->url = $url;
			$this->title = $title;
			$this->description = $description;
		}

		/**
		 * @return string
		 */
		public function getDescription()
		{
			return $this->description;
		}

		/**
		 * @return int
		 */
		public function getId()
		{
			return $this->id;
		}

		/**
		 * @return string
		 */
		public function getTitle()
		{
			return $this->title;
		}

		/**
		 * @return string
		 */
		public function getUrl()
		{
			return $this->url;
		}

		/**
		 * @param string $description
		 */
		public function setDescription($description)
		{
			$this->description = $description;
		}

		/**
		 * @param string $title
		 */
		public function setTitle($title)
		{
			$this->title = $title;
		}

		/**
		 * @param string $url
		 */
		public function setUrl($url)
		{
			$this->url = $url;
		}

		/**
		 * Persist any changes made into the database.
		 */
		public function persist()
		{
			$query = DB::get()->prepare('UPDATE site_links SET url = :url, title = :title, description = :desc WHERE ID = :id');
			$query->setValue(':url', $this->getUrl());
			$query->setValue(':title', $this->getTitle());
			$query->setValue(':desc', $this->getDescription());
			$query->setValue(':id', $this->getId());
			$query->execute();
		}

		/**
		 * Delete this site link
		 */
		public function delete()
		{
			DB::get()->prepare('DELETE FROM site_links WHERE ID = :id')->setValue(':id', $this->getId())->execute();
		}

		/**
		 * Retrieve a site link by an ID.
		 * @param int $id ID of the site link.
		 * @return null|SiteLink
		 */
		public static function get($id)
		{
			$query = DB::get()->prepare('SELECT url, title, description FROM site_links WHERE ID = :id');
			$query->setValue(':id', $id);

			$result = $query->getFirstRow();
			return $result === NULL ? NULL : new SiteLink($id, $result->url, $result->title, $result->description);
		}

		/**
		 * Return all site links available.
		 * @return SiteLink[]
		 */
		public static function getAll()
		{
			$links = Array();

			foreach (DB::get()->prepare('SELECT ID, url, title, description FROM site_links ORDER BY title ASC')->getRows() as $row)
				$links[$row->ID] = new SiteLink($row->ID, $row->url, $row->title, $row->description);

			return $links;
		}

		/**
		 * Create a new site link.
		 * @param string $url
		 * @param $title
		 * @param $description
		 * @return SiteLink
		 */
		public static function create($url, $title, $description)
		{
			$query = DB::get()->prepare('INSERT INTO site_links (url, title, description) VALUES(:url, :title, :desc)');
			$query->setValue(':url', $url);
			$query->setValue(':title', $title);
			$query->setValue(':desc', $description);
			$query->execute();

			return new SiteLink(DB::get()->getLastInsertID('site_links'), $url, $title, $description);
		}

		/**
		 * @var int
		 */
		private $id;

		/**
		 * @var string
		 */
		private $url;

		/**
		 * @var string
		 */
		private $title;

		/**
		 * @var string
		 */
		private $description;
	}
?>