<div id="new-link-button" class="module module-padded">
	Click here to add a new link to this listing.
</div>
<div id="link-listing">
<?php
	if (count($this->links))
	{
		/**
		 * @var SiteLink $link
		 */
		foreach ($this->links as $link)
		{
			?>
			<div class="module module-padded site-link" id="link-<?php echo $link->getId(); ?>" url="<?php echo $link->getUrl(); ?>">
				<h1><?php echo $link->getTitle(); ?></h1>
				<p><?php echo $link->getDescription(); ?></p>
			</div>
			<?php
		}
	}
	else
	{
		?>
		<div class="module module-padded">
			<p class="center">There are no links on the site at this moment in time! Check back later.</p>
		</div>
		<?php
	}
?>
</div>