---
title: Discoveries of the Counterparty Alert System Project
date: '2022-06-02'
tags: ['tech', 'finance', 'machine learning']
draft: false
summary: Key discoveries of FYP, software engineering side and data science side
---

During the last year, my team and I have been working on a proof of concept project in collaboration with SocGen as the graduation final year project. The project is a portfolio monitoring system which fetch news from online source and perform auto-analysis with NLP.

Instead of describing the full technical details and results as available in the final report, I would like to talk about some special efforts and unexpected gain in this project. For more details, please refer to the [final report](/static/files/99_LIX1_Final.pdf) and [source code](https://github.com/SGHKUST-FYP-Portfolio-Alert/portfolio-early-alert-intelligent-backend).

## Key for Efficient Sentiment Score - Volume Weighted Exponential MA

During the project, we have struggled to form a effective sentiment indicator. The key issue are <b>oscillations</b> and <b>agility</b>.
In normal circumstances, this two factors are contradictory. The raw daily sentiment is severely fluctuated and has poor readability.
However when smoothing is applied, the indicator loss flexibility to response to abrupt changes, which is suboptimal as a indicator that need to capture sudden event that detriments the sentiment.

In regard to this issue, we discovered volume weighted exponential MA as a very efficient indicator. This indicator weights observations based on two principles

Exponential weight - Recent observations are more important.
Volume weighting - Observations with higher volume are more credible.

The formulation of the MA indicator is,

$$
S_{T} = \frac{\sum_{t=0}^T \alpha^{T-t}V_ts_t}{\sum_{t=0}^T \alpha^{T-t}V_t}
$$

where $\alpha$ is the exponential time decay factor between $[0,1]$ (chosen $0.7$ for this project), $V_t$ is the volume (news count) of day $t$ and $s_t$ is the raw indicator (sentiment score) of fay $t$.

This indicator is especially useful in construction of a sensible sentiment score as the fluctuation is smoothed out just like the ordinary Exponential MA, while the volume weight enables abrupt changes that are accompanied by high news counts to be reflected.

## The Rich Functions of MongoDB that supported our Project

In the project planning phase, we have decided to choose MongoDB merely for the purpose that it is one of the most popular NoSQL, that fits our usage as we expect imcomplete data is prevalent in our use case. When building the project, we discovered the powerful features of MongoDB that has enhanced the efficiency and usability of our application.

In analyzing keyword topics frequency, text index searching enables us to capture only related news without downloading the whole news storage, while consuming low computation resources. In generating topic embeddings, we have used this function to get all news that contain a list of designated keywords.

```python
def gen_topic_embed(topic: TopicCreate):
    # regex: \b(keyword1)\b|\b(keyword2)\b/i
    regex = [f'\\b({x})\\b' for x in topic['keywords']]
    regex = '|'.join(regex)

    # get all news embedding with keywords in headline
    cur = db.get_news({'headline': { '$regex': regex, '$options' : 'i' },
                        'embedding': { '$exists': True } },
                        projection={'_id':1, 'headline':1, 'embedding':1})
```

Meanwhile, another features we frequently used are aggregation functions. It is utilized to sum up daily sentiment without have to calculate programmatically on the server, saving efforts, computation resource of server and outbound traffic. Use case to count the numer of positive and negative news and generate sentiment score is shown below,

```python
def aggregate_sentiments_daily():

    counterparties = [
        c['symbol'] for c in db.database['counterparty'].find(projection=['symbol'])
    ]
    pipeline = [
        { '$match': {'counterparty': {'$in': counterparties}, 'sentiment': {'$exists': True}}},
        {'$group': {'_id': { 'date': '$date', 'counterparty': '$counterparty', 'sentiment': '$sentiment'}, 'count':{'$sum':1}}},
        {'$group': {'_id': {'date':'$_id.date', 'counterparty':'$_id.counterparty'}, 'news_count': {'$sum': '$count'}, 'sentiments': {'$addToSet' : {'k': {'$toString': '$_id.sentiment'}, 'v':'$count'}}}},
        {'$project': {'_id': 0, 'date':'$_id.date', 'counterparty':'$_id.counterparty', 'news_count': 1, 'sentiments': {'$arrayToObject': '$sentiments'} }},
        {'$group': {'_id': '$counterparty', 'results': {'$push': {'date': '$date', 'news_count': '$news_count', 'sentiments': '$sentiments'}}}},
        {'$project':{'_id': 0, 'counterparty': '$_id', 'results': 1}}
    ]

    aggregated = db.aggregate_news(pipeline)
```

## Optimizing performance by using special React Hooks and Highcharts

To allow the chart to be as interactive as possible, we have added features like displaying/ hiding data or jumping to news of the corresponding date when clicking on the chart. The implementation of these features rely on React state. However, the change of react state causes Highcharts to render, which each takes notable time and causes the webpage to be stuck.

To resolve this performance issue, we have utilized some advanced React hooks. By using useMemo, we are able specify a non-default logic for components to re-render. In the below example, we prevents charts from re-rendering by specifying that re-render is only required when <b>chartData</b> is updated, so that the updates of other props does not render the charts.

```javascript
function propsAreEqual(prevProps, nextProps) {
  return prevProps.chartData === nextProps.chartData
}

export default withRouter(memo(Chart, propsAreEqual))
```

Chart display updates are done by calling Highcharts javascript API instead of re-rendering the whole chart.

```javascript
function handleChange(evt, keys) {
  let changes = Object.fromEntries(keys.map((key) => [[key], evt.target.checked]))
  setChecked({ ...checked, ...changes })
  Object.entries(changes).map(([k, v]) => {
    highcharts.series[serieskeyToIdx[k]].setVisible(v, false)
  })
  highcharts.redraw()
}
```
