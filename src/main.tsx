import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Authenticator, ThemeProvider } from '@aws-amplify/ui-react';
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";
import { amplifyTheme } from "./amplifyTheme";
import '@aws-amplify/ui-react/styles.css';

Amplify.configure(outputs);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={amplifyTheme}>
      <div className="dark min-h-screen bg-background text-foreground">
        <Authenticator>
          <App />
        </Authenticator>
      </div>
    </ThemeProvider>
  </React.StrictMode>
);

