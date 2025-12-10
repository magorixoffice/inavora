import { useMemo } from 'react';
import { Users } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Scatter } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const TwoByTwoGridPresenterView = ({
  slide,
  gridResults = [],
  totalResponses = 0
}) => {
  const hasResponses = totalResponses > 0 && Array.isArray(gridResults) && gridResults.length > 0;

  console.log("slide data", slide);
  const axisXLabel = useMemo(() => slide?.gridAxisXLabel || 'Horizontal', [slide?.gridAxisXLabel]);
  const axisYLabel = useMemo(() => slide?.gridAxisYLabel || 'Vertical', [slide?.gridAxisYLabel]);

  const axisRange = useMemo(() => {
    console.log('Presenter slide data:', slide);
    console.log('Axis range:', slide?.gridAxisRange);
    return {
      min: slide?.gridAxisRange?.min ?? 0,
      max: slide?.gridAxisRange?.max ?? 10
    };
  }, [slide]);

  const colors = useMemo(() => {
    return [
      'rgb(239, 68, 68)',   // red
      'rgb(59, 130, 246)',  // blue
      'rgb(16, 185, 129)',  // green
      'rgb(245, 158, 11)',  // amber
      'rgb(139, 92, 246)',  // violet
      'rgb(236, 72, 153)',  // pink
      'rgb(14, 165, 233)',  // sky
      'rgb(132, 204, 22)',  // lime
      'rgb(251, 146, 60)',  // orange
      'rgb(168, 85, 247)',  // purple
    ];
  }, [])

  const chartData = useMemo(() => {
    if (!hasResponses) {
      return {
        datasets: []
      };
    }

    // Show only one dot per item at the average position (actual axis values)
    const datasets = gridResults.map((item, index) => {
      if (item.count === 0) {
        return {
          label: item.label,
          data: [],
          backgroundColor: colors[index % colors.length],
          borderColor: colors[index % colors.length],
          pointRadius: 10,
          pointHoverRadius: 12,
        };
      }

      // Use actual axis values (no conversion needed)
      return {
        label: item.label,
        data: [{ x: Math.round(item.averageX * 10) / 10, y: Math.round(item.averageY * 10) / 10 }],
        backgroundColor: colors[index % colors.length],
        borderColor: colors[index % colors.length],
        pointRadius: 10,
        pointHoverRadius: 12,
      };
    });

    return { datasets };
  }, [hasResponses, gridResults, colors]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        min: axisRange.min,
        max: axisRange.max,
        title: {
          display: true,
          text: axisXLabel,
          color: '#E0E0E0',
          font: {
            size: 16,
            weight: 'bold'
          }
        },
        grid: {
          display: true,
          drawBorder: true,
          color: (context) => {
            const midValue = (axisRange.min + axisRange.max) / 2;
            if (context.tick.value === midValue) {
              return 'rgba(255, 255, 255, 0.2)';
            }
            return 'rgba(255, 255, 255, 0.05)';
          },
          lineWidth: (context) => {
            const midValue = (axisRange.min + axisRange.max) / 2;
            if (context.tick.value === midValue) {
              return 2;
            }
            return 1;
          }
        },
        ticks: {
          color: '#E0E0E0',
          // Let Chart.js determine the best step size
        }
      },
      y: {
        type: 'linear',
        min: axisRange.min,
        max: axisRange.max,
        title: {
          display: true,
          text: axisYLabel,
          color: '#E0E0E0',
          font: {
            size: 16,
            weight: 'bold'
          }
        },
        grid: {
          display: true,
          drawBorder: true,
          color: (context) => {
            const midValue = (axisRange.min + axisRange.max) / 2;
            if (context.tick.value === midValue) {
              return 'rgba(255, 255, 255, 0.2)';
            }
            return 'rgba(255, 255, 255, 0.05)';
          },
          lineWidth: (context) => {
            const midValue = (axisRange.min + axisRange.max) / 2;
            if (context.tick.value === midValue) {
              return 2;
            }
            return 1;
          }
        },
        ticks: {
          color: '#E0E0E0',
          // Let Chart.js determine the best step size
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'right',
        labels: {
          usePointStyle: true,
          padding: 15,
          color: '#E0E0E0',
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: '#1F1F1F',
        borderColor: '#2A2A2A',
        borderWidth: 1,
        titleColor: '#E0E0E0',
        bodyColor: '#E0E0E0',
        callbacks: {
          label: function (context) {
            const label = context.dataset.label || '';
            return `${label}:  ( ${axisXLabel} - ${context.parsed.x}, ${axisYLabel} - ${context.parsed.y} )`;
          }
        }
      }
    },
    animation: {
      duration: 750,
      easing: 'easeInOutQuart'
    }
  }), [axisRange, axisXLabel, axisYLabel]);
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="rounded-2xl sm:rounded-3xl border border-[#2A2A2A] bg-[#1F1F1F] p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col gap-4 sm:gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#E0E0E0]">{slide?.question || '2×2 Grid results'}</h2>
            <div className="flex items-center gap-2 rounded-full bg-[#1D2A20] border border-[#2E7D32]/30 px-4 py-2">
              <Users className="h-4 w-4 text-[#4CAF50]" />
              <span className="text-sm font-medium text-[#4CAF50]">{totalResponses} response{totalResponses === 1 ? '' : 's'}</span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-start">
            {/* Left: Scatter Graph */}
            <div className="flex-1 w-full lg:flex-[1.3] lg:min-w-[520px]">
              {!hasResponses ? (
                <div className="flex items-center justify-center py-24 sm:py-32 text-[#6C6C6C] bg-[#2A2A2A] rounded-xl">
                  <p className="text-sm">Waiting for responses...</p>
                </div>
              ) : (
                <div className="bg-[#2A2A2A] rounded-xl p-4 cursor-pointer" style={{ height: 420 }}>
                  <Scatter data={chartData} options={options} />
                </div>
              )}
            </div>

            {/* Right: Items List */}
            <div className="w-full lg:flex-1">
              <h3 className="text-sm font-semibold text-[#E0E0E0] mb-3">Items</h3>
              <div className="space-y-3">
                {gridResults.length === 0 ? (
                  <div className="text-center text-sm text-[#6C6C6C] py-8 bg-[#2A2A2A] rounded-lg">
                    No items configured
                  </div>
                ) : (
                  gridResults.map((item, index) => {
                    // Display actual axis values (no conversion needed)
                    const displayX = item.count > 0 ? item.averageX : 0;
                    const displayY = item.count > 0 ? item.averageY : 0;

                    return (
                      <div key={item.id} className="bg-[#2A2A2A] rounded-lg p-4 border border-[#2F2F2F]">
                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className="w-4 h-4 rounded-full flex-shrink-0"
                            style={{ backgroundColor: colors[index % colors.length] }}
                          />
                          <span className="text-base font-semibold text-[#E0E0E0]">{item.label}</span>
                        </div>
                        <div className="text-sm text-[#B0B0B0] ml-7">
                          <div>
                            <span> {axisXLabel} : {displayX} / </span>
                            <span> {axisYLabel} : {displayY} </span>
                          </div>
                          <div className="text-xs text-[#6C6C6C] mt-1">{item.count} response{item.count === 1 ? '' : 's'}</div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoByTwoGridPresenterView;
