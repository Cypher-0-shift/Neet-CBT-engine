import React, { useEffect, useRef, useState } from 'react';
import ReactECharts, { EChartsReactProps } from 'echarts-for-react';
import * as echarts from 'echarts';

interface EChartWrapperProps extends Omit<EChartsReactProps, 'echarts'> {
  title?: string;
  className?: string;
  height?: number | string;
  width?: number | string;
  loading?: boolean;
}

// Define our custom theme colors
const theme = {
  color: [
    '#3b82f6', // app-primary
    '#10b981', // green (correct)
    '#ef4444', // red (incorrect)
    '#f59e0b', // yellow (skipped)
    '#8b5cf6', // purple
    '#06b6d4', // cyan
    '#f43f5e', // rose
  ],
  backgroundColor: 'transparent',
  textStyle: {
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  title: {
    textStyle: {
      color: '#1f2937', // gray-800
      fontWeight: 600,
    },
  },
  tooltip: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: '#e5e7eb', // gray-200
    textStyle: {
      color: '#374151', // gray-700
    },
    extraCssText: 'box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border-radius: 0.5rem;',
  },
  legend: {
    textStyle: {
      color: '#4b5563', // gray-600
    },
  },
};

// Register theme once
echarts.registerTheme('neet-theme', theme);

export const EChartWrapper: React.FC<EChartWrapperProps> = ({
  option,
  title,
  className = '',
  height = 300,
  width = '100%',
  loading = false,
  ...props
}) => {
  const chartRef = useRef<ReactECharts>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [, setDimensions] = useState({ width: 0, height: 0 });

  // Debounced resize observer
  useEffect(() => {
    if (!containerRef.current) return;

    let timeoutId: NodeJS.Timeout;
    
    const resizeObserver = new ResizeObserver((entries) => {
      clearTimeout(timeoutId);
      
      timeoutId = setTimeout(() => {
        if (entries[0] && chartRef.current) {
          const { width, height } = entries[0].contentRect;
          setDimensions({ width, height });
          chartRef.current.getEchartsInstance().resize();
        }
      }, 100); // 100ms debounce
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      clearTimeout(timeoutId);
    };
  }, []);

  // Show loading spinner if data isn't ready
  if (loading) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-50 rounded-lg border border-gray-100 ${className}`}
        style={{ height, width }}
      >
        <div className="animate-spin w-8 h-8 border-4 border-app-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className={`flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
      )}
      <div 
        ref={containerRef}
        className="flex-1 w-full p-4 relative"
        style={{ height, width }}
      >
        <ReactECharts
          ref={chartRef}
          option={option}
          echarts={echarts}
          theme="neet-theme"
          style={{ height: '100%', width: '100%' }}
          notMerge={true}
          lazyUpdate={true}
          {...props}
        />
      </div>
    </div>
  );
};
