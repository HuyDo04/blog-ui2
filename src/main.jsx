import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AppRoutes, ScrollToTop, ErrorBoundary } from "./components";
import "./styles/index.scss";
import { Provider, useDispatch } from "react-redux";
import store, { persistor } from "@/store/index";
import { PersistGate } from "redux-persist/integration/react";
import fetchCurrentUser from "./features/auth/authAsync";

const ReduxApp = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            dispatch(fetchCurrentUser())
        }
    }, [dispatch]);
    return (
        <ScrollToTop>
            <AppRoutes />
        </ScrollToTop>
    )
}

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <ErrorBoundary>
           <Provider store={store}>
           <PersistGate loading={null} persistor={persistor}>
            <BrowserRouter>
                <ReduxApp />
            </BrowserRouter>
            </PersistGate>
            </Provider>
        </ErrorBoundary>
    </React.StrictMode>
);
