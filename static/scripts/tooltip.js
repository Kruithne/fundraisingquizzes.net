var pageContainer;
var tooltip = {
	pageBound: 10
};

tooltip.hover = function()
{
	var hoveredObject = $(this),
		tooltipText = hoveredObject.attr('tooltip');

	if (tooltipText !== undefined)
	{
		var hoveredObjectOffset = hoveredObject.offset(),
			px = 'px';
		tooltip.label.html(tooltipText);

		var left = (hoveredObjectOffset.left - (tooltip.tooltip.width() / 2)) + (hoveredObject.width() / 2),
			pageContainerLeft = pageContainer.offset().left,
			pageContainerRight = pageContainerLeft + pageContainer.width(),
			tooltipRight = left + tooltip.tooltip.width();

		if (tooltipRight > (pageContainerRight - tooltip.pageBound))
			left -= (tooltipRight - pageContainerRight) + tooltip.pageBound;

		if (left < (pageContainerLeft + tooltip.pageBound))
			left += (pageContainerLeft - left) + tooltip.pageBound;

		tooltip.tooltip.css('left', left + px);

		tooltip.tooltip.css('top', (hoveredObjectOffset.top - tooltip.tooltip.height()) + px);
		tooltip.tooltip.show();
	}
};

tooltip.hide = function()
{
	tooltip.tooltip.hide();
};

$(document).ready(function()
{
	pageContainer = $('#container');

	tooltip.tooltip = $('<div id="tooltip"/>').appendTo($('body'));
	tooltip.label = $('<div id="tooltip-label"/>').appendTo(tooltip.tooltip);

	$(document).on('mouseenter', '*', tooltip.hover);
	$(document).on('mouseleave', '*', tooltip.hide);
});