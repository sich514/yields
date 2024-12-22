import {
  Flex,
  Text,
  Button,
  IconButton,
  Grid,
  TextField,
  Table,
  Box,
} from "@radix-ui/themes";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";

export default function RiskIndicator(props) {
  function getColorForRisk(risk) {
    const hue = (1 - risk / 10) * 120; // Calculate hue value for the HSL color space
    return `hsl(${hue}, 100%, 40%)`; // Generate color based on hue, saturation, and lightness
  }

  return (
    <div style={{ width: props.size, height: props.size }}>
      <CircularProgressbar
        value={props.risk}
        strokeWidth={10}
        maxValue={10}
        text={props.risk}
        styles={buildStyles({
          // Text size
          textSize: props.textSize,

          // Colors
          pathColor: getColorForRisk(props.risk),
          textColor: getColorForRisk(props.risk),
        })}
      />
    </div>
  );
}
