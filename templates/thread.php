<script>
	var thread = <?php echo json_encode($this->thread); ?>;
</script>
<div class="module module-padded" id="thread-header">
	<div class="left">
		<span class="strong"><?php echo $this->thread->getTitle(); ?></span> by <span class="strong"><?php echo $this->thread->getCreatorName(); ?></span> (Created <span class="time-period"><?php echo $this->thread->getPosted(); ?></span>)
	</div>
	<div class="right"></div>
	<div class="float-block"></div>
</div>
<div class="page-bar module module-padded">
	<div class="left">
		<a class="first">&laquo; First Page</a>
		<a class="previous">&laquo; Previous Page</a>
	</div>
	<div class="right">
		<a class="next">&raquo; Next Page</a>
		<a class="last">&raquo; Last Page</a>
	</div>
	<div class="float-block"></div>
</div>
<div id="thread-listing"></div>
<div class="module module-padded" id="loading">
	<p><img src="http://static.fundraisingquizzes.net/images/loading.gif"/></p>
	<p>Loading...</p>
</div>
<div class="page-bar module module-padded">
	<div class="left">
		<a class="first">&laquo; First Page</a>
		<a class="previous">&laquo; Previous Page</a>
	</div>
	<div class="right">
		<a class="next">&raquo; Next Page</a>
		<a class="last">&raquo; Last Page</a>
	</div>
	<div class="float-block"></div>
</div>
<div class="module-padded module comment-box">
	<h1>Post a Reply...</h1><a name="comment"></a>
	<textarea class="input-text" placeholder="Treat everyone with the same respect you would expect in return!"></textarea>
	<input type="button" value="Post Reply" id="comment-button" class="input-button"/> <input type="button" value="Cancel Editing" id="reset-button" class="input-button"/>
</div>