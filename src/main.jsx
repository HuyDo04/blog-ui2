import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AppRoutes, ScrollToTop, ErrorBoundary } from "./components";
import "./styles/index.scss";
import { Provider } from "react-redux";
import store, { persistor } from "@/store/index";
import { PersistGate } from "redux-persist/integration/react";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <ErrorBoundary>
           <Provider store={store}>
           <PersistGate loading={null} persistor={persistor}>
            <BrowserRouter>
                <ScrollToTop>
                    <AppRoutes />
                </ScrollToTop>
            </BrowserRouter>
            </PersistGate>
            </Provider>
        </ErrorBoundary>
    </React.StrictMode>
);
