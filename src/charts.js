class ChartColors {
  constructor() {
    this.colors = [
      'rgba(255, 99, 132, 0.2)',
      'rgba(54, 162, 235, 0.2)',
      'rgba(255, 206, 86, 0.2)',
      'rgba(75, 192, 192, 0.2)',
      'rgba(153, 102, 255, 0.2)',
      'rgba(255, 159, 64, 0.2)'
    ];
    this.cache = {};
  }

  getColors(count) {
    let result = this.cache[count];
    if (!result) {
      result = [];
      for (let i = 0; i < count; i++) {
        result.push(this.colors[i % this.colors.length]);
      }
      this.cache[count] = result;
    }

    return result;
  }
}

const chartColors = new ChartColors();

class PieChartVisController {
  constructor(ctx, title) {
    this.ctx = ctx;
    this.title = title;
  }

  /**
   * interface DataPoint {
   *  title: string;
   *  val: number;
   * }
   * 
   * @param {DataPoint[]} data 
   */
  setData(data) {
    const labels = [];
    const dataValues = [];
    data.forEach(i => {
      labels.push(i.title);
      dataValues.push(i.val);
    });

    const colors = chartColors.getColors(dataValues.length);

    if (!this.chart) {
      this.chart = new Chart(this.ctx, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            data: dataValues,
            backgroundColor: colors
          }]
        },
        options: {
          title: {
            display: true,
            text: this.title
          },
          responsive: true
        }
      });
    } else {
      this.chart.config.data.labels = labels;
      this.chart.config.data.datasets[0].data = dataValues;
      this.chart.config.data.datasets[0].backgroundColor = colors;
      this.chart.update();
    }
  }
}

class BarChartController {
  constructor(ctx, title) {
    this.ctx = ctx;
    this.title = title;
  }

  /**
   * interface DataPoint {
   *  title: string;
   *  val: number;
   * }
   * 
   * @param {DataPoint[]} data 
   */
  setData(data) {
    const labels = [];
    const dataValues = [];
    data.forEach(i => {
      labels.push(i.title);
      dataValues.push(i.val);
    });

    const colors = chartColors.getColors(dataValues.length);

    if (!this.chart) {
      this.chart = new Chart(this.ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            data: dataValues,
            backgroundColor: colors
          }]
        },
        options: {
          title: {
            display: true,
            text: this.title
          },
          responsive: true
        }
      });
    } else {
      this.chart.config.data.labels = labels;
      this.chart.config.data.datasets[0].data = dataValues;
      this.chart.config.data.datasets[0].backgroundColor = colors;
      this.chart.update();
    }
  }
}