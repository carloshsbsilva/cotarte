import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

interface PriceChartProps {
  priceHistory: {
    date: string;
    price: number;
  }[];
  period: '1D' | '1W' | '1M' | '1Y' | 'All';
}

const PriceChart: React.FC<PriceChartProps> = ({ priceHistory, period }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    
    // Destroy previous chart instance if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    // Create new chart
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;
    
    // Process data based on selected period
    const filteredData = filterDataByPeriod(priceHistory, period);

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: filteredData.map(item => formatDate(item.date, period)),
        datasets: [{
          label: 'Preço por cota (R$)',
          data: filteredData.map(item => item.price),
          borderColor: getPriceChangeColor(filteredData),
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 6,
          tension: 0.3,
          fill: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function(context) {
                return `R$ ${context.parsed.y.toFixed(2)}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false,
              drawBorder: false,
            },
            ticks: {
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 8,
            }
          },
          y: {
            grid: {
              borderDash: [5, 5],
              color: 'rgba(0, 0, 0, 0.1)',
            },
            ticks: {
              callback: function(value) {
                return `R$ ${value}`;
              }
            }
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        },
        elements: {
          point: {
            backgroundColor: getPriceChangeColor(filteredData),
          }
        }
      }
    });
    
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [priceHistory, period]);
  
  // Helper functions
  const filterDataByPeriod = (data: PriceChartProps['priceHistory'], period: PriceChartProps['period']) => {
    const now = new Date();
    let cutoffDate = new Date();
    
    switch(period) {
      case '1D':
        cutoffDate.setDate(now.getDate() - 1);
        break;
      case '1W':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case '1M':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case '1Y':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'All':
      default:
        return data;
    }
    
    return data.filter(item => new Date(item.date) >= cutoffDate);
  };
  
  const formatDate = (dateString: string, period: PriceChartProps['period']) => {
    const date = new Date(dateString);
    switch(period) {
      case '1D':
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      case '1W':
        return date.toLocaleDateString('pt-BR', { weekday: 'short' });
      case '1M':
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
      case '1Y':
      case 'All':
        return date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      default:
        return dateString;
    }
  };
  
  const getPriceChangeColor = (data: PriceChartProps['priceHistory']) => {
    if (data.length < 2) return '#000000';
    const firstPrice = data[0].price;
    const lastPrice = data[data.length - 1].price;
    return lastPrice >= firstPrice ? '#10B981' : '#EF4444';
  };

  return (
    <div className="h-64 w-full">
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default PriceChart;