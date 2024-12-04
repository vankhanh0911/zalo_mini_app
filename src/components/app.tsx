import React from 'react';
import { Route} from 'react-router-dom'
import { App, ZMPRouter, AnimationRoutes, SnackbarProvider } from 'zmp-ui'; 
import { RecoilRoot } from 'recoil';
import Form from '../pages/form';
import ThankyouPage from '../pages/thankyou';


const MyApp = () => {
  return (
    <RecoilRoot>
      <App>
        <SnackbarProvider>
          <ZMPRouter>
            <AnimationRoutes>
              <Route path="/" element={<Form></Form>}></Route>
              <Route path="/thankyou" element={<ThankyouPage></ThankyouPage>}></Route>
            </AnimationRoutes>
          </ZMPRouter>
        </SnackbarProvider>
      </App>
    </RecoilRoot>
  );
}
export default MyApp;