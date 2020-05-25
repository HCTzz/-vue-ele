<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
import resize from './mixins/resize'
import {getLineCharts} from '@/api/index'
export default {
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: 'auto'
    },
    height: {
      type: String,
      default: '300px'
    },
    autoResize: {
      type: Boolean,
      default: true
    },
    chartData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      chart: null,
      xAxis:[],
      log:[],
      photo:[],
      video:[]
    }
  },
  watch: {
    chartData: {
      deep: true,
      handler(val) {
        this.setOptions(val)
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart()
    })
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    initChart() {
      getLineCharts().then(res => {
          let data = res.data;
          this.xAxis = data.day;
          this.log = data.log;
          this.photo = data.photo;
          this.video = data.video;
          this.chart = echarts.init(this.$el, 'macarons')
          this.setOptions(this.chartData)
      })
    },
    setOptions({ expectedData, actualData } = {}) {
      this.chart.setOption({
        xAxis: {
           axisLabel:{
              showMaxLabel: true,
              interval :0,
              rotate:45
          },
          data: this.xAxis,
          boundaryGap: false,
          axisTick: {
            show: false
          }
        },
        grid: {
          left: 10,
          right: 10,
          bottom: 20,
          top: 30,
          containLabel: true
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          },
          padding: [5, 10]
        },
        yAxis: {
          axisTick: {
            show: false
          }
        },
        legend: {
          data: ['笔记', '照片','视频']
        },
        series: [{
          name: '笔记', itemStyle: {
            normal: {
              color: '#FF005A',
              lineStyle: {
                color: '#FF005A',
              }
            }
          },
          smooth: true,
          type: 'line',
          data: this.log,
          animationDuration: 2800,
          animationEasing: 'cubicInOut'
        },
        {
          name: '照片',
          smooth: true,
          type: 'line',
          itemStyle: {
            normal: {
              color: '#3888fa',
              lineStyle: {
                color: '#3888fa',
              },
              areaStyle: {
                color: '#f3f8ff'
              }
            }
          },
          data: this.photo,
          animationDuration: 2800,
          animationEasing: 'quadraticOut'
        },
        {
          name: '视频',
          smooth: true,
          type: 'line',
          itemStyle: {
            normal: {
              color: '#3888fa',
              lineStyle: {
                color: '#3888fa',
              },
              areaStyle: {
                color: '#f3f8ff'
              }
            }
          },
          data: this.video,
          animationDuration: 2800,
          animationEasing: 'quadraticOut'
        }
        ]
      })
    }
  }
}
</script>
