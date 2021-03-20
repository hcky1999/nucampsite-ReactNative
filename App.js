import React from 'react';
import Main from './components/MainComponent';
import { Provider } from 'react-redux';
import { ConfigureStore } from './redux/configureStore';
import { PersistGate } from 'redux-persist/es/integration/react';
import Loading from './components/LoadingComponent';
console.disableYellowBox = true;

//bringing together process store and the store using object destructuring syntax
const { persistor, store } = ConfigureStore();

export default function App() {
  return (
      //wrap with persist gate component provided by redux-persist to help integrate react and react native apps it help application from rendering the until rehydrated from the client side storage
    <Provider store={store}>
      <PersistGate
                loading={<Loading />}
                persistor={persistor}>
                <Main />
            </PersistGate>
    </Provider>
  ); 

}

