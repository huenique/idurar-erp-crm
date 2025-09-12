const moment = require('moment');

const summary = async (Model, req, res) => {
  let defaultType = 'month';
  const { type } = req.query;

  if (type && ['week', 'month', 'year'].includes(type)) {
    defaultType = type;
  } else if (type) {
    return res.status(400).json({
      success: false,
      result: null,
      message: 'Invalid type',
    });
  }

  const currentDate = moment();
  let startDate = currentDate.clone().startOf(defaultType);
  let endDate = currentDate.clone().endOf(defaultType);

  const pipeline = [
    {
      $facet: {
        totalInteractions: [
          {
            $match: {
              enabled: true,
            },
          },
          {
            $count: 'count',
          },
        ],
        newInteractions: [
          {
            $match: {
              created: { $gte: startDate.toDate(), $lte: endDate.toDate() },
              enabled: true,
            },
          },
          {
            $count: 'count',
          },
        ],
        completedInteractions: [
          {
            $match: {
              status: 'completed',
              enabled: true,
            },
          },
          {
            $count: 'count',
          },
        ],
        pendingInteractions: [
          {
            $match: {
              status: 'pending',
              enabled: true,
            },
          },
          {
            $count: 'count',
          },
        ],
      },
    },
  ];

  const aggregationResult = await Model.aggregate(pipeline);

  const result = aggregationResult[0];
  const totalInteractions = result.totalInteractions[0] ? result.totalInteractions[0].count : 0;
  const totalNewInteractions = result.newInteractions[0] ? result.newInteractions[0].count : 0;
  const completedInteractions = result.completedInteractions[0] ? result.completedInteractions[0].count : 0;
  const pendingInteractions = result.pendingInteractions[0] ? result.pendingInteractions[0].count : 0;

  const totalNewInteractionsPercentage = totalInteractions > 0 ? (totalNewInteractions / totalInteractions) * 100 : 0;
  const completedInteractionsPercentage = totalInteractions > 0 ? (completedInteractions / totalInteractions) * 100 : 0;

  return res.status(200).json({
    success: true,
    result: {
      total: totalInteractions,
      new: Math.round(totalNewInteractionsPercentage),
      completed: Math.round(completedInteractionsPercentage),
      pending: pendingInteractions,
    },
    message: 'Successfully get summary of interactions',
  });
};

module.exports = summary;