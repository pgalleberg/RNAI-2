const customBlue = {
  50: "#e9f0fb",
  100: "#c8daf4",
  200: "#a3c1ed",
  300: "#7ea8e5",
  400: "#6395e0",
  500: "#4782da",
  600: "#407ad6",
  700: "#2f65cb",
  800: "#1f2641",
  900: "#2052c2 ",
};

const defaultVariant = {
  name: "DEFAULT",
  palette: {
    mode: "light",
    primary: {
      main: customBlue[500],
      hover: customBlue[400],
      contrastText: "#FFF",
    },
    secondary: {
      main: customBlue[500],
      contrastText: "#FFF",
    },
    background: {
      default: "#eff2fa",
      paper: "#FFF",
    },
    active:{
      main: '#deeaff'
    },
    hover:{
      main: '#fafbff'
    }
  },
};

const variants = [
  defaultVariant
];

export default variants;
