import React, { useEffect, useRef, useCallback } from 'react';
import type { ChartConfig, BoxplotData } from '../types/index';
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

      case 'histogram':
        // 计算直方图数据
        const values = config.data.map(item => item[config.value_field!]);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const binCount = Math.min(Math.ceil(Math.sqrt(values.length)), 30); // 使用平方根法则，但限制最大箱数
        const binWidth = (max - min) / binCount;
        const bins = Array(binCount).fill(0);
        
        values.forEach(value => {
          const binIndex = Math.min(Math.floor((value - min) / binWidth), binCount - 1);
          bins[binIndex]++;
        });

        const binData = bins.map((count, i) => ({
          value: count,
          interval: [
            min + i * binWidth,
            min + (i + 1) * binWidth
          ]
        }));

        return {
          ...baseOption,
          xAxis: {
            type: 'value',
            name: config.x_axis || '数值',
            axisLabel: { color: '#666' }
          },
          yAxis: {
            type: 'value',
            name: '频数',
            axisLabel: { color: '#666' }
          },
          series: [{
            type: 'bar',
            data: binData.map(bin => ({
              value: bin.value,
              name: `${bin.interval[0].toFixed(2)} - ${bin.interval[1].toFixed(2)}`
            })),
            barWidth: '99%',
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#667eea' },
                { offset: 1, color: '#764ba2' }
              ])
            }
          }]
        };

      case 'boxplot':
        // 计算箱线图数据
        const prepareBoxplotData = (data: any[], valueField: string, groupField?: string): BoxplotData | BoxplotData[] => {
          if (!groupField) {
            const values = data.map(item => Number(item[valueField])).sort((a: number, b: number) => a - b);
            return calculateBoxplotData(values);
          }

          const groups = data.reduce((acc: Record<string, number[]>, item) => {
            const group = item[groupField];
            if (!acc[group]) acc[group] = [];
            acc[group].push(Number(item[valueField]));
            return acc;
          }, {});

          return Object.entries(groups).map(([group, values]) => ({
            name: group,
            ...calculateBoxplotData(values.sort((a: number, b: number) => a - b))
          }));
        };

        const calculateBoxplotData = (sortedValues: number[]): BoxplotData => {
          const len = sortedValues.length;
          const q1Index = Math.floor(len * 0.25);
          const q2Index = Math.floor(len * 0.5);
          const q3Index = Math.floor(len * 0.75);

          const q1 = sortedValues[q1Index];
          const q2 = sortedValues[q2Index];
          const q3 = sortedValues[q3Index];
          const iqr = q3 - q1;
          const min = Math.max(sortedValues[0], q1 - 1.5 * iqr);
          const max = Math.min(sortedValues[len - 1], q3 + 1.5 * iqr);

          // 计算异常值
          const outliers = sortedValues.filter(v => v < min || v > max);

          return {
            boxData: [min, q1, q2, q3, max],
            outliers: outliers
          };
        };

        const boxplotData = prepareBoxplotData(
          config.data,
          config.value_field!,
          config.category_column
        );

        const isMultipleBoxplots = Array.isArray(boxplotData) && boxplotData.length > 0;

        return {
          ...baseOption,
          xAxis: {
            type: 'category',
            data: isMultipleBoxplots
              ? (boxplotData as BoxplotData[]).map(item => item.name)
              : [''],
            axisLabel: { color: '#666' }
          },
          yAxis: {
            type: 'value',
            name: config.value_field,
            axisLabel: { color: '#666' }
          },
          series: [{
            type: 'boxplot',
            data: isMultipleBoxplots
              ? (boxplotData as BoxplotData[]).map(item => item.boxData)
              : [(boxplotData as BoxplotData).boxData],
            itemStyle: {
              color: '#667eea',
              borderColor: '#764ba2'
            }
          }, {
            type: 'scatter',
            data: isMultipleBoxplots
              ? (boxplotData as BoxplotData[]).flatMap((item, idx) => 
                  item.outliers.map((value: number) => [idx, value]))
              : (boxplotData as BoxplotData).outliers.map((value: number) => [0, value]),
            itemStyle: {
              color: '#e53e3e',
              opacity: 0.6
            }
          }]
        };

      case 'table':
        return {
          ...baseOption,
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            top: '15%',
            containLabel: true
          },
          dataset: {
            dimensions: Object.keys(config.data[0] || {}),
            source: config.data
          },
          xAxis: { type: 'category' },
          yAxis: {},
          series: [{
            type: 'table',
            encode: {
              x: Object.keys(config.data[0] || {})[0],
              y: Object.keys(config.data[0] || {})[1]
            }
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