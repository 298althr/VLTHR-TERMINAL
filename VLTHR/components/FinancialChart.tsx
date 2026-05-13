'use client';

import { useEffect, useRef } from 'react';
import { createChart, ColorType, ISeriesApi, SeriesType } from 'lightweight-charts';

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
    lineColor = '#0a84ff',
    textColor = 'rgba(255, 255, 255, 0.4)',
    areaTopColor = 'rgba(10, 132, 255, 0.2)',
    areaBottomColor = 'rgba(10, 132, 255, 0.0)',
  } = {}
}: ChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current?.clientWidth });
    };

    const chart = createChart(chartContainerRef.current, {
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
      width: chartContainerRef.current.clientWidth,
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

    let series: ISeriesApi<SeriesType>;

    if (type === 'line') {
      const lineSeries = chart.addAreaSeries({
        lineColor,
        topColor: areaTopColor,
        bottomColor: areaBottomColor,
        lineWidth: 2,
      });
      lineSeries.setData(data.map(p => ({ time: p.t / 1000 as any, value: p.c })));
      series = lineSeries;
    } else {
      const candleSeries = chart.addCandlestickSeries({
        upColor: '#30d158',
        downColor: '#ff453a',
        borderVisible: false,
        wickUpColor: '#30d158',
        wickDownColor: '#ff453a',
      });
      candleSeries.setData(data.map(p => ({ 
        time: p.t / 1000 as any, 
        open: p.o, 
        high: p.h, 
        low: p.l, 
        close: p.c 
      })));
      series = candleSeries;
    }

    chart.timeScale().fitContent();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data, type, backgroundColor, lineColor, textColor, areaTopColor, areaBottomColor]);

  return <div ref={chartContainerRef} className="w-full" />;
};
