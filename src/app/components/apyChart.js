import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { faker } from "@faker-js/faker";
import { useMediaQuery } from "react-responsive";

export default function ApyChart(props) {
  const isMobile = useMediaQuery({ maxWidth: 768 }); // Adjust the max width as needed

  ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement);

  const options = {
    responsive: true,
    scales: {
      x: {
        type: "category",
        ticks: {
          maxTicksLimit: isMobile ? 8 : 6,
        },
      },
      y: {
        type: "linear",
        display: true,
        position: "right",
        ticks: {
          callback: function (value) {
            return value + "%"; // Add % sign to y-axis labels
          },
        },
      },
    },
  };

  // Get a max of the last 30 data points
  const historyData = props.historyData;

  const labels = historyData.map((data) =>
    new Date(data.timestamp * 1000).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
    })
  );

  const apyData = historyData.map((data) => data.apy * 100);

  const data = {
    labels: labels,
    datasets: [
      {
        label: "APY",
        data: apyData,
        borderColor: "rgba(53, 162, 235, 1)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
        yAxisID: "y",
      },
    ],
  };

  return <Line options={options} data={data} />;
}
