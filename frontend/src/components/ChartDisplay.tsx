import React, { useEffect, useRef } from 'react';
import type { ChartConfig } from '../types/index';
import * as echarts from 'echarts';

interface ChartDisplayProps {
  chartConfig: ChartConfig;
}

const ChartDisplay: React.FC<ChartDisplayProps> = ({ chartConfig }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current || !chartConfig) return;

    // 初始化图表
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    // 根据图表类型生成配置
    const option = generateChartOption(chartConfig);
    chartInstance.current.setOption(option, true);

    // 响应式处理
    const handleResize = () => {
      chartInstance.current?.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [chartConfig]);

  useEffect(() => {
    return () => {
      chartInstance.current?.dispose();
    };
  }, []);

  const generateChartOption = (config: ChartConfig) => {
    const baseOption = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#667eea',
        borderWidth: 1,
        textStyle: {
          color: '#333'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '15%',
        containLabel: true
      }
    };

    switch (config.chart_type) {
      case 'line':
        return {
          ...baseOption,
          xAxis: {
            type: 'category',
            data: config.data.map(item => item[config.x_axis!]),
            axisLabel: { color: '#666' }
          },
          yAxis: {
            type: 'value',
            axisLabel: { color: '#666' }
          },
          series: [{
            type: 'line',
            data: config.data.map(item => item[config.y_axis!]),
            smooth: true,
            lineStyle: {
              width: 3,
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: '#667eea' },
                { offset: 1, color: '#764ba2' }
              ])
            },
            itemStyle: {
              color: '#667eea'
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(102, 126, 234, 0.3)' },
                { offset: 1, color: 'rgba(102, 126, 234, 0.1)' }
              ])
            }
          }]
        };

      case 'bar':
        return {
          ...baseOption,
          xAxis: {
            type: 'category',
            data: config.data.map(item => item[config.x_axis!]),
            axisLabel: { color: '#666' }
          },
          yAxis: {
            type: 'value',
            axisLabel: { color: '#666' }
          },
          series: [{
            type: 'bar',
            data: config.data.map(item => item[config.y_axis!]),
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#667eea' },
                { offset: 1, color: '#764ba2' }
              ]),
              borderRadius: [4, 4, 0, 0]
            }
          }]
        };

      case 'pie':
        return {
          ...baseOption,
          tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)'
          },
          series: [{
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['50%', '60%'],
            data: config.data.map(item => ({
              name: item[config.name_field!],
              value: item[config.value_field!]
            })),
            itemStyle: {
              borderRadius: 8,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: true,
              formatter: '{b}: {d}%'
            }
          }]
        };

      case 'scatter':
        return {
          ...baseOption,
          xAxis: {
            type: 'value',
            axisLabel: { color: '#666' }
          },
          yAxis: {
            type: 'value',
            axisLabel: { color: '#666' }
          },
          series: [{
            type: 'scatter',
            data: config.data.map(item => [
              item[config.x_axis!],
              item[config.y_axis!]
            ]),
            itemStyle: {
              color: '#667eea',
              opacity: 0.7
            },
            symbolSize: 8
          }]
        };

      default:
        return {
          ...baseOption,
          xAxis: {
            type: 'category',
            data: config.data.map((_, index) => `项目${index + 1}`),
            axisLabel: { color: '#666' }
          },
          yAxis: {
            type: 'value',
            axisLabel: { color: '#666' }
          },
          series: [{
            type: 'bar',
            data: config.data.map(item => Object.values(item)[0]),
            itemStyle: {
              color: '#667eea'
            }
          }]
        };
    }
  };

  if (!chartConfig || !chartConfig.data || chartConfig.data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-gray-500">暂无图表数据</p>
      </div>
    );
  }

  return (
    <div 
      ref={chartRef} 
      className="w-full h-80 bg-gray-50 rounded-lg"
      style={{ minHeight: '320px' }}
    />
  );
};

export default ChartDisplay; 