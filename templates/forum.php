<script>
	var postCount = <?php echo $this->post_count; ?>;
</script>
<div id="random-fact" class="module-padded module">
	<b>Did you know: </b> <?php echo $this->fact->getText(); ?> <a href="thread.php?id=<?php echo $this->fact->getThreadId(); ?>"><?php echo $this->fact->getThread()->getReplyCount() - 1; ?> Comment(s)</a>
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
<div class="module module-padded" id="listing-header">
	<div class="title">Topic Title</div>
	<div class="author">Author</div>
	<div class="posted">Posted</div>
	<div class="reply-count">Replies</div>
	<div class="view-count">Views</div>
</div>
<div id="forum-listing"></div>
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
	<h1>Create New Topic...</h1><a name="comment"></a>
	<input type="text" class="input-text title" placeholder="Topic title..."/>
	<textarea class="input-text" placeholder="Remember, our site is based around a no-answer policy!"></textarea>
	<input type="button" value="Post Topic" id="comment-button" class="input-button"/>
</div>