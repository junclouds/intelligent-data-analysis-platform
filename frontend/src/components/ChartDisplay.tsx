import React, { useEffect, useRef, useCallback } from 'react';
import type { ChartConfig } from '../types/index';
import * as echarts from 'echarts';

interface ChartDisplayProps {
  chartConfig: ChartConfig;
}

const ChartDisplay: React.FC<ChartDisplayProps> = ({ chartConfig }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  // 初始化或更新图表的函数
  const initOrUpdateChart = useCallback(() => {
    if (!chartRef.current || !chartConfig) return;

    try {
      // 如果实例不存在，创建新实例
      if (!chartInstance.current) {
        console.log('Creating new chart instance');
        chartInstance.current = echarts.init(chartRef.current);
      }

      // 生成并设置图表配置
      const option = generateChartOption(chartConfig);
      console.log('Setting chart option:', option);
      chartInstance.current.setOption(option, true);

    } catch (error) {
      console.error('Error in chart initialization/update:', error);
    }
  }, [chartConfig]);

  // 处理窗口大小变化
  const handleResize = useCallback(() => {
    if (chartInstance.current) {
      chartInstance.current.resize();
    }
  }, []);

  // 组件挂载和更新时的处理
  useEffect(() => {
    initOrUpdateChart();

    // 添加resize监听
    window.addEventListener('resize', handleResize);

    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
      // 只在组件真正卸载时才销毁实例
      if (chartInstance.current) {
        console.log('Disposing chart instance');
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, [initOrUpdateChart, handleResize]);

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
            axisLabel: { 
              color: '#666',
              rotate: 45,
              interval: 'auto'
            }
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
            axisLabel: { 
              color: '#666',
              rotate: 45,
              interval: 'auto'
            }
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
            },
            barWidth: '60%'
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
      className="w-full h-80 bg-white rounded-lg shadow-inner"
      style={{ 
        minHeight: '320px',
        padding: '20px'
      }}
    />
  );
};

export default React.memo(ChartDisplay); 