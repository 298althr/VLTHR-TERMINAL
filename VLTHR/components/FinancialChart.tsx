'use client';

import { useEffect, useRef } from 'react';
import {
  createChart,
  ColorType,
  AreaSeries,
  CandlestickSeries,
  type IChartApi,
} from 'lightweight-charts';

interface ChartProps {
  data: { t: number; o: number; h: number; l: number; c: number; v: number }[];
  type?: 'line' | 'candlestick';
  colors?: {
    backgroundColor?: string;
    lineColor?: string;
    textColor?: string;
    areaTopColor?: string;
    areaBottomColor?: string;
  };
}

export const FinancialChart = ({
  data,
  type = 'line',
  colors: {
    backgroundColor = 'transparent',
    lineColor = '#0071e3',
    textColor = 'rgba(245, 245, 247, 0.4)',
    areaTopColor = 'rgba(0, 113, 227, 0.2)',
    areaBottomColor = 'rgba(0, 113, 227, 0.0)',
  } = {},
}: ChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current || !data || data.length === 0) return;

    const container = chartContainerRef.current;

    const chart = createChart(container, {
      layout: {
        background: { type: ColorType.Solid, color: backgroundColor },
        textColor,
        fontSize: 10,
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.03)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.03)' },
      },
      width: container.clientWidth,
      height: 200,
      timeScale: {
        borderVisible: false,
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderVisible: false,
      },
      handleScroll: false,
      handleScale: false,
    });

    chartRef.current = chart;

    if (type === 'line') {
      const series = chart.addSeries(AreaSeries, {
        lineColor,
        topColor: areaTopColor,
        bottomColor: areaBottomColor,
        lineWidth: 2,
      });
      series.setData(
        data.map((p) => ({ time: Math.floor(p.t / 1000) as any, value: p.c }))
      );
    } else {
      const series = chart.addSeries(CandlestickSeries, {
        upColor: '#28c840',
        downColor: '#ff5f57',
        borderVisible: false,
        wickUpColor: '#28c840',
        wickDownColor: '#ff5f57',
      });
      series.setData(
        data.map((p) => ({
          time: Math.floor(p.t / 1000) as any,
          open: p.o,
          high: p.h,
          low: p.l,
          close: p.c,
        }))
      );
    }

    chart.timeScale().fitContent();

    const handleResize = () => {
      chart.applyOptions({ width: container.clientWidth });
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
    };
  }, [data, type, backgroundColor, lineColor, textColor, areaTopColor, areaBottomColor]);

  return <div ref={chartContainerRef} className="w-full" />;
};
