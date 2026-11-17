
import { StrictMode, Component } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("WELLsB runtime error:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: "25px", color: "red", background: "white" }}>
          <h2>WELLsB encountered an error</h2>
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {this.state.error.toString()}
          </pre>
          <p>Please share this error message.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
