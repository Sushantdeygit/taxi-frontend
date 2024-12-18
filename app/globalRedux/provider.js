"use client";
import { Provider } from "react-redux";
import { store } from "./store";
import { Toaster } from "@/components/ui/toaster";
import { SocketProvider } from "@/contexts/SocketContext";
import { PersistGate } from "redux-persist/integration/react";
import { Spinner } from "@/components/Loaders/Spinner";
import { persistor } from "./store";
import { RideProvider } from "@/contexts/RideContext";
import { MapProvider } from "@/contexts/MapContext";
function ProviderWrapper({ children }) {
  return (
    <Provider store={store}>
      <PersistGate loading={<Spinner />} persistor={persistor}>
        <SocketProvider>
          <MapProvider>
            <RideProvider>{children}</RideProvider>
          </MapProvider>
        </SocketProvider>
      </PersistGate>
      <Toaster />
    </Provider>
  );
}

export default ProviderWrapper;
