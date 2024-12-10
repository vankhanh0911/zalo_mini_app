import React from 'react';
import { Route} from 'react-router-dom'
import { App, ZMPRouter, AnimationRoutes, SnackbarProvider } from 'zmp-ui'; 
import { RecoilRoot } from 'recoil';
import Form from '../pages/form';
import ThankyouPage from '../pages/thankyou';

const queryString = window.location.search;
    const urlParamsInZalo = new URLSearchParams(queryString);
  
    var _portalId = urlParamsInZalo.get('portal_id') || '561236459'; // Portal DEMO 
    var _propId = urlParamsInZalo.get('prop_web_id') || '561236460'; 
    var _ATM_TRACKING_ASSOCIATE_UTM = 0 ; // http://demo-e.cdp.asia/1 

    (function() {
    var w: any= window;
    if (w.web_event) return;
    var a: any = (window as any).web_event = function() {
        a.queue.push(arguments);
    }
    a.propId = _propId;
    a.portalId = _portalId;
    a.portal_id = _portalId;
    a._portalId = _portalId;
    a.track = a;
    a.queue = [];
    var e = document.createElement("script");
    e.type = "text/javascript", e.async = !0, e.src = "//st-a.cdp.asia/insight.js";
    var t: any = document.getElementsByTagName("script")[0];
    t.parentNode.insertBefore(e, t)
  })();


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