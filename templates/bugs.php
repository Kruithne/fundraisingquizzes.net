<div class="module module-padded">
	<h1>Bugs!</h1>
	<p>Below you will find any of the outstanding bugs relating to our website. If you have found any problems please check it is not already posted below, if it's not, feel free to submit a bug!</p>
</div>
<div class="module module-padded">
	<h1>Open Bugs</h1>
	<?php
		if (count($this->open_bugs))
		{
			foreach ($this->open_bugs as $bug)
			{
				$bugText = sprintf(
					'%s - Submitted <span class="date">%s</span> by %s',
					$bug->title, $bug->submitted,
					UserHandler::GetUsername($bug->submitter)
				);

				?><p id="bug"><a>[OPEN] <?php echo $bugText; ?></a></p><?php
			}
		}
		else
		{
			?><p>There are no open bugs, hooray!</p><?php
		}
	?>
</div>
<div class="module module-padded">
	<h1>Closed Bugs</h1>
	<?php
		if (count($this->closed_bugs))
		{
			foreach ($this->closed_bugs as $bug)
			{
				$bugText = sprintf(
					'%s - Submitted <span class="date">%s</span> by %s',
					$bug->title, $bug->submitted,
					UserHandler::GetUsername($bug->submitter)
				);

				?><p id="bug"><a>[CLOSED] <?php echo $bugText; ?></a></p><?php
			}
		}
		else
		{
			?><p>There are no closed bugs, eek!</p><?php
		}
	?>
</div>