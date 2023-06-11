import "@fontsource/merriweather/300.css";
import "@fontsource/merriweather/400.css";
import "@fontsource/merriweather/700.css";
import "@fontsource/merriweather/900.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import {
  createTheme,
  responsiveFontSizes,
  ThemeProvider,
} from "@mui/material/styles";
import { Analytics } from "@vercel/analytics/react";
import Head from "next/head";
import Link from "next/link";
import { ReactNode } from "react";

var theme = createTheme({
  typography: {
    allVariants: {
      fontFamily: "Merriweather, serif",
    },
    button: {
      fontFamily: "Roboto, Arial, sans-serif",
    },
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
  },
});

theme = responsiveFontSizes(theme);

type Props = {
  children?: ReactNode;
  title?: string;
};

const Layout = ({ children, title = "This is the default title" }: Props) => (
  <ThemeProvider theme={theme}>
    <CssBaseline>
      <Container maxWidth="sm">
        <Head>
          <title>{title}</title>
          <meta charSet="utf-8" />
          <meta
            name="viewport"
            content="initial-scale=1.0, width=device-width"
          />
          <link rel="shortcut icon" href="/static/favicon.ico" />
        </Head>
        <header>
          <nav>
            <Link href="/">Home</Link> | <Link href="/about">About</Link>
          </nav>
        </header>
        {children}
        <footer>
          <hr />
          <span>
            <Link href="mailto:feedback@storytime.place">Feedback</Link>
          </span>
        </footer>
      </Container>
      <Analytics />
    </CssBaseline>
  </ThemeProvider>
);

export default Layout;
