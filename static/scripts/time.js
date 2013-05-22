var TimeMachine = {
	UnixMinute: 60,
	UnixHour: 3600,
	UnixDay: 86400,
	UnixWeek: 604800,
	UnixMonth: 2419200,
	UnixYear: 29030400,
	NegUnixMinute: -60,
	NegUnixHour: -3600,
	NegUnixDay: -86400,
	NegUnixWeek: -604800,
	NegUnixMonth: -2419200,
	NegUnixYear: -29030400
};

TimeMachine.timeDivide = function(difference, period)
{
	return Math.floor(difference / period);
};

TimeMachine.getFormalTimePeriod = function(date)
{
	var split = date.split("-"),
		difference = (new Date(split[0], split[1], split[2]).getTime() - new Date().getTime()) / 1000,
		value = 0, text;

	alert(difference);

	switch (true)
	{
		case difference > TimeMachine.UnixYear:
			value = TimeMachine.timeDivide(difference, TimeMachine.UnixYear);
			text = 'year';
		break;

		case difference > TimeMachine.UnixMonth:
			value = TimeMachine.timeDivide(difference, TimeMachine.UnixMonth);
			text = 'month';
		break;

		case difference > TimeMachine.UnixWeek:
			value = TimeMachine.timeDivide(difference, TimeMachine.UnixWeek);
			text = 'week';
		break;

		case difference > TimeMachine.UnixDay:
			value = TimeMachine.timeDivide(difference, TimeMachine.UnixDay);
			text = 'day';
		break;

		case difference > TimeMachine.UnixHour:
			value = TimeMachine.timeDivide(difference, TimeMachine.UnixHour);
			text = 'hour';
		break;

		case difference > TimeMachine.UnixMinute:
			value = TimeMachine.timeDivide(difference, TimeMachine.UnixMinute);
			text = 'minute';
		break;

		case difference < TimeMachine.UnixMinute && difference > 0:
			return 'Less than a minute';
		break;

		case difference > TimeMachine.NegUnixMinute && difference < 0:
			return 'Less than a minute ago';
		break;

		case difference > TimeMachine.NegUnixHour:
			value = TimeMachine.timeDivide(difference, TimeMachine.NegUnixMinute);
			text = 'minute';
		break;

		case difference > TimeMachine.NegUnixDay:
			value = TimeMachine.timeDivide(difference, TimeMachine.NegUnixHour);
			text = 'hour';
		break;

		case difference > TimeMachine.NegUnixWeek:
			value = TimeMachine.timeDivide(difference, TimeMachine.NegUnixDay);
			text = 'day';
		break;

		case difference > TimeMachine.NegUnixMonth:
			value = TimeMachine.timeDivide(difference, TimeMachine.NegUnixWeek);
			text = 'week';
		break;

		case difference > TimeMachine.NegUnixYear:
			value = TimeMachine.timeDivide(difference, TimeMachine.NegUnixMonth);
			text = 'month';
		break;

		case difference < TimeMachine.NegUnixYear:
			value = TimeMachine.timeDivide(difference, TimeMachine.NegUnixYear);
			text = 'year';
		break;
	}

	if (value > 1)
		text += 's';

	return value + ' ' + text + (difference < 0 ? ' ago' : '');
};