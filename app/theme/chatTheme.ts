import { createTheme } from "@mui/material";

export const createChatTheme = (darkMode: boolean) =>
  createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: {
        main: darkMode ? "#00a884" : "#128C7E",
      },
      background: {
        default: darkMode ? "#111b21" : "#f0f2f5",
        paper: darkMode ? "#202c33" : "#ffffff",
      },
    },
    components: {
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              backgroundColor: darkMode ? "#2a3942" : "#ffffff",
            },
          },
        },
      },
    },
  });
