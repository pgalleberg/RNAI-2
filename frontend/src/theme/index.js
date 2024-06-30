import { createTheme as createMuiTheme } from "@mui/material/styles";
import variants from "./variants";
import typography from "./typography";
import breakpoints from "./breakpoints";
import components from "./components";
import shadows from "./shadows";

const createTheme = () => {
  let themeConfig = variants[0];

  return createMuiTheme(
    {
      spacing: 4,
      breakpoints: breakpoints,
      // @ts-ignore
      components: components,
      typography: typography,
      shadows: shadows,
      palette: themeConfig.palette,
    },
    {
      name: themeConfig.name,
    }
  );
};

export default createTheme;
